# 🔍 Модуль 4.2: Стек ELK / OpenSearch (Elasticsearch, Filebeat, Kibana)

Стек ELK (Elasticsearch, Logstash/Filebeat, Kibana) или его опенсорсный форк **OpenSearch** — классический мощный стек централизованного логирования с полнотекстовым поиском.

---

## 1. Компоненты стека

* **Filebeat:** Легковесный агент (Shipper), написанный на Go. Читает лог-файлы на серверах и быстро пересылает их дальше с минимальным потреблением CPU/RAM.
* **Logstash (опционально):** Мощный процессор обработки данных (фильтры `grok`, мутации полей, парсинг гео-IP). Потребляет много памяти (Java).
* **Elasticsearch / OpenSearch:** Распределенная NoSQL поисковая база данных на базе Apache Lucene. Индексирует весь текст каждого документа.
* **Kibana / OpenSearch Dashboards:** Веб-интерфейс для поиска по логам (Discover), создания диаграмм (Visualize) и дашбордов.

---

## 2. Формат структурированных логов (JSON vs Plain Text)

Современные приложения пишут логи в JSON:
```json
{
  "timestamp": "2026-08-16T21:00:15.123Z",
  "level": "ERROR",
  "service": "billing-api",
  "trace_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_id": 48291,
  "message": "Payment gateway timeout after 5000ms",
  "status_code": 504
}
```
**Преимущества:**
* Не нужно писать сложные регулярные выражения (`grok`) для парсинга.
* Каждое поле (`user_id`, `status_code`) сразу доступно для быстрой фильтрации в Kibana.

---

## 3. Базовый поиск в Kibana (KQL - Kibana Query Language)

* Поиск точного значения: `service: "billing-api"`
* Поиск по коду ответа: `status_code >= 500`
* Логические операторы: `service: "billing-api" AND level: "ERROR" AND NOT message: "test"`
* Поиск по маске: `message: *timeout*`
* Проверка наличия поля: `_exists_: error_details`
