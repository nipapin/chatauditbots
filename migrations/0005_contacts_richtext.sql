-- Контакты: одно свободное поле вместо отдельных email/phone, чтобы можно было
-- указать любые мессенджеры и соцсети со ссылками.
alter table bots add column contacts text;

update bots set contacts = nullif(trim(both E'\n' from concat_ws(E'\n',
  case when contact_email is not null and contact_email <> '' then 'Email: ' || contact_email end,
  case when contact_phone is not null and contact_phone <> '' then 'Телефон: ' || contact_phone end
)), '');

alter table bots drop column contact_email;
alter table bots drop column contact_phone;
