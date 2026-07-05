-- Помечаем мокап-диалоги (dev-сидер), чтобы их можно было отличить от настоящих и удалить.
alter table dialogs add column is_mock boolean not null default false;
