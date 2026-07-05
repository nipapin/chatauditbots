-- Раздельные цвета для светлой и тёмной темы виджета.
alter table widget_configs rename column primary_color to primary_color_light;
alter table widget_configs rename column bot_bubble_color to bot_bubble_color_light;
alter table widget_configs rename column user_bubble_color to user_bubble_color_light;
alter table widget_configs rename column background_color to background_color_light;

alter table widget_configs add column primary_color_dark text;
alter table widget_configs add column bot_bubble_color_dark text;
alter table widget_configs add column user_bubble_color_dark text;
alter table widget_configs add column background_color_dark text;

update widget_configs set
  primary_color_dark = coalesce(primary_color_dark, primary_color_light),
  bot_bubble_color_dark = coalesce(bot_bubble_color_dark, '#2e3a22'),
  user_bubble_color_dark = coalesce(user_bubble_color_dark, primary_color_light),
  background_color_dark = coalesce(background_color_dark, '#1c1c1e');
