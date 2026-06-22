import React, { useState } from "react";
import "../css/styles.css";

export default function CMSFrontend() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">📱</div>
          <div>
            <div className="sidebar-title">CMS Pro</div>
            <div className="sidebar-subtitle">Система управления контентом</div>
          </div>
        </div>
        <nav className="nav">
          {[
            { id: "dashboard", label: "Панель управления", icon: "📊" },
            { id: "pages", label: "Страницы", icon: "📄" },
            { id: "media", label: "Медиа", icon: "🖼️" },
            { id: "editor", label: "Редактор", icon: "✏️" },
            { id: "settings", label: "Настройки", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-btn ${activeTab === item.id ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "pages" && <Pages />}
        {activeTab === "media" && <Media />}
        {activeTab === "editor" && <Editor />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="content active">
      <h1>Панель управления</h1>
      <p className="content-subtitle">Добро пожаловать! Вот обзор вашей CMS.</p>
      
      <div className="stats-grid">
        <StatCard icon="📄" title="Всего страниц" value="24" change="+3 сегодня" color="blue" />
        <StatCard icon="🖼️" title="Медиа файлы" value="156" change="+12 на этой неделе" color="pink" />
        <StatCard icon="👥" title="Активные пользователи" value="89" change="+5 онлайн" color="green" />
        <StatCard icon="📈" title="Вовлеченность" value="94%" change="+8% в прошлому месяцу" color="purple" />
      </div>
      
      <div className="activity-grid">
        <div className="activity-box">
          <h2>🔄 Недавняя активность</h2>
          <ActivityItem icon="✓" title="Опубликовано: Блог пост 'Будущее веб-дизайна'" time="2 часа назад" type="success" />
          <ActivityItem icon="✎" title="Обновлено: Контент страницы 'О нас'" time="4 часа назад" type="edit" />
          <ActivityItem icon="⬆" title="Загружено: Изображение баннера" time="1 день назад" type="upload" />
          <ActivityItem icon="🗑" title="Удалено: Старые материалы кампании" time="2 дня назад" type="delete" />
        </div>
        
        <div className="notifications-box">
          <h2>⚠️ Уведомления</h2>
          <Notification title="Новый комментарий в посте блога" time="8 минут назад" type="info" />
          <Notification title="Загрузка медиа завершена" time="1 час назад" type="warning" />
          <Notification title="Резервная копия успешно завершена" time="3 часа назад" type="success" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <div className="stat-change positive">{change}</div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, type }) {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${type}`}>{icon}</div>
      <div className="activity-content">
        <h3>{title}</h3>
        <div className="activity-time">{time}</div>
      </div>
    </div>
  );
}

function Notification({ title, time, type }) {
  return (
    <div className={`notification-item ${type}`}>
      <h4>{title}</h4>
      <div className="notification-time">{time}</div>
    </div>
  );
}

function Pages() {
  const [pages] = useState([
    { id: 1, title: "Home" },
    { id: 2, title: "About" },
    { id: 3, title: "Services" },
    { id: 4, title: "Contact" },
  ]);

  return (
    <div className="content">
      <h1>Страницы</h1>
      <p className="content-subtitle">Управление страницами вашего сайта</p>
      <div className="list">
        {pages.map((page) => (
          <div key={page.id} className="list-item">
            <span>📄 {page.title}</span>
            <button className="edit-btn">Редактировать</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Media() {
  return (
    <div className="content">
      <h1>Медиа библиотека</h1>
      <p className="content-subtitle">Управление вашими изображениями и файлами</p>
      <div className="upload-zone">
        <p>📁 Загрузите файлы сюда или нажмите для выбора</p>
      </div>
    </div>
  );
}

function Editor() {
  const [content, setContent] = useState("");

  return (
    <div className="content">
      <h1>Редактор контента</h1>
      <p className="content-subtitle">Создавайте и редактируйте контент</p>
      <div className="editor-area">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Напишите ваш контент здесь..."
        />
        <button className="save-btn">💾 Сохранить</button>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="content">
      <h1>Настройки</h1>
      <p className="content-subtitle">Управляйте параметрами вашей CMS</p>
      <div className="settings-box">
        <p>⚙️ Параметры резервного копирования и SEO будут здесь</p>
      </div>
    </div>
  );
}
