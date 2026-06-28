-- Garantiza RLS (Row Level Security) habilitado en todas las tablas públicas.
-- Idempotente: habilitar algo ya habilitado no produce error.
-- (Verificado: en el proyecto vh-group ya estaba activo en todas las tablas;
--  esto sirve como red de seguridad / documentación.)

alter table public.profiles                 enable row level security;
alter table public.vehicles                 enable row level security;
alter table public.vehicle_photos           enable row level security;
alter table public.expenses                  enable row level security;
alter table public.clients                    enable row level security;
alter table public.sales                      enable row level security;
alter table public.price_history              enable row level security;
alter table public.price_lists                enable row level security;
alter table public.price_list_items           enable row level security;
alter table public.employees                  enable row level security;
alter table public.employee_payments          enable row level security;
alter table public.employee_salary_history    enable row level security;
alter table public.transfers                   enable row level security;
alter table public.pagares_contracts          enable row level security;
alter table public.pagares_payments           enable row level security;
