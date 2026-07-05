-- Виджет: 4 цвета вместо 2, тема оформления, подзаголовок; логотип убран.
alter table widget_configs rename column accent_color to bot_bubble_color;
alter table widget_configs add column user_bubble_color text;
alter table widget_configs add column background_color text;
alter table widget_configs add column theme text not null default 'light' check (theme in ('light', 'dark'));
alter table widget_configs add column subtitle text not null default 'Онлайн-чат';

update widget_configs set user_bubble_color = coalesce(user_bubble_color, primary_color);
update widget_configs set background_color = coalesce(background_color, '#ffffff');

alter table widget_configs drop column logo_url;

-- Бот: контакты для базы знаний + кэш её AI-резюме.
alter table bots add column contact_email text;
alter table bots add column contact_phone text;
alter table bots add column knowledge_summary text;
alter table bots add column knowledge_summary_updated_at timestamptz;

-- База знаний: текстовый источник + сохранённое содержимое для предпросмотра/резюме.
alter table knowledge_documents drop constraint knowledge_documents_source_type_check;
alter table knowledge_documents add constraint knowledge_documents_source_type_check
  check (source_type in ('file', 'link', 'text'));
alter table knowledge_documents add column content text;

-- Диалоги: кэш AI-резюме (о чём был диалог и чем закончился).
alter table dialogs add column summary text;
