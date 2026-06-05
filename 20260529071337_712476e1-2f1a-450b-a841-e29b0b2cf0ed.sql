
-- ENUMS
create type public.app_role as enum ('admin','guest');
create type public.order_status as enum ('confirmed','preparing','chef_assigned','out_for_delivery','delivered','cancelled');
create type public.payment_method as enum ('upi','credit_card','debit_card','net_banking','cod');
create type public.payment_status as enum ('pending','paid','failed');
create type public.service_type as enum ('housekeeping','laundry','spa');
create type public.service_request_status as enum ('pending','in_progress','completed','cancelled');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  room_number text not null default '',
  loyalty_points integer not null default 1250,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Profile policies
create policy "profiles_self_select" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles_self_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));

-- user_roles policies
create policy "roles_self_select" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- AUTO PROFILE + DEFAULT ROLE
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, room_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    coalesce(new.raw_user_meta_data->>'room_number','')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'guest') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- MENU
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);
grant select on public.menu_categories to authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "menu_cat_read" on public.menu_categories for select to authenticated using (true);
create policy "menu_cat_admin_all" on public.menu_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image_url text not null default '',
  rating numeric(2,1) not null default 4.5,
  prep_time_min int not null default 25,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "menu_items_read" on public.menu_items for select to authenticated using (true);
create policy "menu_items_admin_all" on public.menu_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SERVICE CATALOG (housekeeping/laundry/spa)
create table public.service_items (
  id uuid primary key default gen_random_uuid(),
  type public.service_type not null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image_url text not null default '',
  duration_min int not null default 30,
  is_active boolean not null default true
);
grant select on public.service_items to authenticated;
grant all on public.service_items to service_role;
alter table public.service_items enable row level security;
create policy "svc_items_read" on public.service_items for select to authenticated using (true);
create policy "svc_items_admin_all" on public.service_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_number text not null default '',
  status public.order_status not null default 'confirmed',
  subtotal numeric(10,2) not null default 0,
  gst numeric(10,2) not null default 0,
  service_charge numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method public.payment_method not null default 'cod',
  payment_status public.payment_status not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders_owner_select" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "orders_owner_insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "orders_owner_update" on public.orders for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  quantity int not null default 1
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order_items_select" on public.order_items for select to authenticated
  using (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "order_items_insert" on public.order_items for insert to authenticated
  with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- SERVICE REQUESTS
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_number text not null default '',
  type public.service_type not null,
  service_item_id uuid references public.service_items(id) on delete set null,
  item_name text not null,
  scheduled_at timestamptz,
  notes text not null default '',
  status public.service_request_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.service_requests to authenticated;
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;
create policy "svc_req_owner_select" on public.service_requests for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "svc_req_owner_insert" on public.service_requests for insert to authenticated with check (user_id = auth.uid());
create policy "svc_req_owner_update" on public.service_requests for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- FEEDBACK
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  food_rating int not null default 5,
  service_rating int not null default 5,
  comment text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "fb_owner_select" on public.feedback for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "fb_owner_insert" on public.feedback for insert to authenticated with check (user_id = auth.uid());

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif_owner_select" on public.notifications for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "notif_owner_insert" on public.notifications for insert to authenticated with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "notif_owner_update" on public.notifications for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- REALTIME
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.service_requests;

-- SEED CATEGORIES
insert into public.menu_categories (name, slug, sort_order) values
('Breakfast','breakfast',1),
('Lunch','lunch',2),
('Dinner','dinner',3),
('Desserts','desserts',4),
('Beverages','beverages',5),
('Snacks','snacks',6);

-- SEED MENU ITEMS
with c as (select id, slug from public.menu_categories)
insert into public.menu_items (category_id, name, description, price, image_url, rating, prep_time_min) values
((select id from c where slug='breakfast'),'Royal Continental Breakfast','Fresh croissants, artisan jams, seasonal fruit, and a pot of imported coffee.',32.00,'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',4.9,20),
((select id from c where slug='breakfast'),'Truffle Eggs Benedict','Poached eggs, black truffle hollandaise, on house-baked brioche.',38.00,'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',4.8,25),
((select id from c where slug='breakfast'),'Avocado & Smoked Salmon Toast','Sourdough, smashed avocado, Norwegian smoked salmon, capers.',28.00,'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',4.7,15),
((select id from c where slug='breakfast'),'Belgian Waffles','Crisp waffles, mascarpone cream, berry compote, maple syrup.',24.00,'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800',4.6,18),
((select id from c where slug='lunch'),'Lobster Bisque','Velvet smooth bisque with cognac and fresh lobster medallions.',42.00,'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',4.9,30),
((select id from c where slug='lunch'),'Wagyu Beef Burger','A5 wagyu, aged cheddar, truffle aioli, brioche bun, hand-cut fries.',48.00,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',4.9,28),
((select id from c where slug='lunch'),'Caesar Salad Royale','Crisp romaine, anchovy dressing, parmesan crisps, garlic croutons.',26.00,'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',4.5,12),
((select id from c where slug='lunch'),'Lemon Butter Linguine','Hand-rolled linguine, lemon butter, parmigiano reggiano, basil.',34.00,'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',4.7,22),
((select id from c where slug='dinner'),'Filet Mignon','8oz prime cut, peppercorn jus, truffle mash, seasonal vegetables.',72.00,'https://images.unsplash.com/photo-1558030006-450675393462?w=800',5.0,35),
((select id from c where slug='dinner'),'Pan-Seared Sea Bass','Mediterranean sea bass, saffron risotto, citrus beurre blanc.',58.00,'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',4.8,32),
((select id from c where slug='dinner'),'Duck à l''Orange','Slow-roasted duck breast, orange glaze, dauphinoise potatoes.',64.00,'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',4.8,40),
((select id from c where slug='dinner'),'Wild Mushroom Risotto','Arborio rice, porcini, truffle oil, aged parmigiano.',36.00,'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',4.7,30),
((select id from c where slug='desserts'),'Crème Brûlée','Madagascar vanilla custard, caramelized sugar crust.',16.00,'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800',4.9,15),
((select id from c where slug='desserts'),'Dark Chocolate Fondant','Warm molten center, vanilla bean ice cream, raspberry coulis.',18.00,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',5.0,18),
((select id from c where slug='desserts'),'Tiramisu Royale','Espresso-soaked savoiardi, mascarpone, cocoa, gold leaf.',17.00,'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',4.8,12),
((select id from c where slug='desserts'),'Seasonal Fruit Platter','Hand-selected exotic fruits, mint, honey-lime drizzle.',14.00,'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800',4.6,10),
((select id from c where slug='beverages'),'Vintage Champagne (Glass)','Dom Pérignon vintage by the glass.',45.00,'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800',5.0,5),
((select id from c where slug='beverages'),'Espresso Martini','Vodka, espresso, coffee liqueur, fine froth.',22.00,'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',4.8,8),
((select id from c where slug='beverages'),'Fresh Pressed Juice','Choice of orange, watermelon, or green detox.',12.00,'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',4.6,5),
((select id from c where slug='beverages'),'Single Origin Coffee','Hand-brewed Ethiopian Yirgacheffe.',9.00,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',4.7,6),
((select id from c where slug='snacks'),'Truffle Fries','Hand-cut fries, black truffle oil, parmesan, herbs.',16.00,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',4.7,12),
((select id from c where slug='snacks'),'Cheese & Charcuterie','Curated artisan cheeses, cured meats, honey, nuts.',38.00,'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800',4.9,10),
((select id from c where slug='snacks'),'Caviar Service','30g Royal Ossetra caviar, blinis, crème fraîche, garnish.',95.00,'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800',5.0,15),
((select id from c where slug='snacks'),'Bruschetta Trio','Tomato basil, mushroom truffle, burrata fig.',22.00,'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800',4.6,12);

-- SEED SERVICES
insert into public.service_items (type, name, description, price, duration_min) values
('housekeeping','Room Cleaning','Full room refresh with eco-friendly products.',0,30),
('housekeeping','Extra Towels','A bundle of plush Egyptian cotton towels.',0,15),
('housekeeping','Fresh Bedsheets','Premium 600-thread-count linen change.',0,20),
('housekeeping','Water Bottles','Two chilled bottles of premium spring water.',0,10),
('housekeeping','Toiletries Restock','Replenish luxury bath amenities.',0,15),
('housekeeping','Maintenance Request','Report any in-room issue for immediate attention.',0,30),
('laundry','Wash & Fold (per kg)','Garments washed, dried, and folded.',15,720),
('laundry','Dry Cleaning (per item)','Delicate fabrics professionally cleaned.',12,1440),
('laundry','Express Service','4-hour turnaround for urgent garments.',25,240),
('spa','Signature Massage (60 min)','Bespoke full-body relaxation with aromatic oils.',180,60),
('spa','Deep Tissue Massage (60 min)','Targeted relief for tension and muscle recovery.',200,60),
('spa','Royal Facial','Luxury treatment with premium serums and gold-leaf mask.',220,75),
('spa','Wellness Day Package','Massage, facial, sauna, and herbal infusion.',520,180);
