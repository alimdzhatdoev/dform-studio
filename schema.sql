-- ================================================================
-- DFORM Studio — Database Schema
-- Эквивалент JSON-хранилища в реляционной модели (MySQL)
-- ================================================================

-- ── Услуги (до orders, т.к. на неё ссылаются) ──────────────────
CREATE TABLE services (
  id          VARCHAR(64)  NOT NULL,
  icon        VARCHAR(10)  DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         DEFAULT NULL,
  price       VARCHAR(100) DEFAULT NULL,
  duration    VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE service_features (
  id         INT          NOT NULL AUTO_INCREMENT,
  service_id VARCHAR(64)  NOT NULL,
  feature    VARCHAR(255) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ── Заказы ──────────────────────────────────────────────────────
CREATE TABLE orders (
  id          VARCHAR(64)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  DEFAULT NULL,
  service_id  VARCHAR(64)  NOT NULL,
  description TEXT         NOT NULL,
  budget      VARCHAR(100) DEFAULT NULL,
  status      ENUM('new','in_progress','completed','cancelled') NOT NULL DEFAULT 'new',
  created_at  DATETIME     NOT NULL,
  updated_at  DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ── Аналитика ───────────────────────────────────────────────────
CREATE TABLE analytics (
  id            INT NOT NULL AUTO_INCREMENT,
  total_orders  INT NOT NULL DEFAULT 0,
  total_revenue INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE analytics_orders_by_day (
  id           INT  NOT NULL AUTO_INCREMENT,
  analytics_id INT  NOT NULL,
  date         DATE NOT NULL,
  count        INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_date (date),
  FOREIGN KEY (analytics_id) REFERENCES analytics(id) ON DELETE CASCADE
);

-- ── Портфолио ───────────────────────────────────────────────────
CREATE TABLE portfolio (
  id                 VARCHAR(64)  NOT NULL,
  title              VARCHAR(255) NOT NULL,
  category           VARCHAR(100) NOT NULL,
  client             VARCHAR(255) NOT NULL,
  year               VARCHAR(10)  NOT NULL,
  description        TEXT         DEFAULT NULL,
  color              VARCHAR(20)  DEFAULT '#7B5EA7',
  stats_duration     VARCHAR(100) DEFAULT NULL,
  stats_deliverables VARCHAR(100) DEFAULT NULL,
  stats_result       VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE portfolio_tags (
  id           INT          NOT NULL AUTO_INCREMENT,
  portfolio_id VARCHAR(64)  NOT NULL,
  tag          VARCHAR(100) NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE
);

-- ── Команда ─────────────────────────────────────────────────────
CREATE TABLE team (
  id       INT          NOT NULL AUTO_INCREMENT,
  name     VARCHAR(255) NOT NULL,
  role     VARCHAR(255) NOT NULL,
  bio      TEXT         DEFAULT NULL,
  initials VARCHAR(5)   DEFAULT NULL,
  color    VARCHAR(20)  DEFAULT '#7B5EA7',
  PRIMARY KEY (id)
);

-- ── Настройки сайта: главный экран ──────────────────────────────
CREATE TABLE site_hero (
  id           INT          NOT NULL DEFAULT 1,
  label        VARCHAR(255) DEFAULT NULL,
  title_line1  VARCHAR(255) DEFAULT NULL,
  title_accent VARCHAR(255) DEFAULT NULL,
  title_line2  VARCHAR(255) DEFAULT NULL,
  title_line3  VARCHAR(255) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ── Настройки сайта: история студии ─────────────────────────────
CREATE TABLE site_about (
  id    INT          NOT NULL DEFAULT 1,
  title VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE site_about_paragraphs (
  id         INT  NOT NULL AUTO_INCREMENT,
  about_id   INT  NOT NULL,
  content    TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (about_id) REFERENCES site_about(id) ON DELETE CASCADE
);

-- ── Настройки сайта: CTA блок ───────────────────────────────────
CREATE TABLE site_cta (
  id          INT          NOT NULL DEFAULT 1,
  tag         VARCHAR(100) DEFAULT NULL,
  title       VARCHAR(255) DEFAULT NULL,
  description TEXT         DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ── Настройки сайта: футер ──────────────────────────────────────
CREATE TABLE site_footer (
  id        INT          NOT NULL DEFAULT 1,
  tagline   VARCHAR(255) DEFAULT NULL,
  copyright VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ── Клиенты студии ──────────────────────────────────────────────
CREATE TABLE clients (
  id   INT          NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

-- ── Статистика (цифры на сайте) ─────────────────────────────────
CREATE TABLE stats (
  id    INT          NOT NULL AUTO_INCREMENT,
  value VARCHAR(50)  NOT NULL,
  label VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

-- ── Ценности компании ───────────────────────────────────────────
CREATE TABLE company_values (
  id          INT          NOT NULL AUTO_INCREMENT,
  icon        VARCHAR(10)  DEFAULT NULL,
  title       VARCHAR(100) NOT NULL,
  description TEXT         DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ── Контакты ────────────────────────────────────────────────────
CREATE TABLE contacts (
  id    INT          NOT NULL AUTO_INCREMENT,
  icon  VARCHAR(10)  DEFAULT NULL,
  label VARCHAR(100) NOT NULL,
  value VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

-- ── Социальные сети ─────────────────────────────────────────────
CREATE TABLE social_links (
  id       INT          NOT NULL AUTO_INCREMENT,
  platform VARCHAR(100) NOT NULL,
  url      VARCHAR(500) NOT NULL,
  PRIMARY KEY (id)
);
