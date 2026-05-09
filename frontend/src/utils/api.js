const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  checkAuth: ()                   => request('/auth'),
  login: (login, password)        => request('/auth', { method: 'POST', body: JSON.stringify({ login, password }) }),
  logout: ()                      => request('/auth', { method: 'DELETE' }),

  // Orders
  getOrders: ()                   => request('/orders'),
  createOrder: (body)             => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id, status) => request(`/orders?id=${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Analytics
  getAnalytics: ()                => request('/analytics'),

  // Portfolio
  getPortfolio: ()                => request('/portfolio'),
  createPortfolioItem: (body)     => request('/portfolio', { method: 'POST', body: JSON.stringify(body) }),
  updatePortfolioItem: (id, body) => request(`/portfolio?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePortfolioItem: (id)       => request(`/portfolio?id=${id}`, { method: 'DELETE' }),

  // Services
  getServices: ()                 => request('/services'),
  createService: (body)           => request('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id, body)       => request(`/services?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteService: (id)             => request(`/services?id=${id}`, { method: 'DELETE' }),

  // Team
  getTeam: ()                     => request('/team'),
  createTeamMember: (body)        => request('/team', { method: 'POST', body: JSON.stringify(body) }),
  updateTeamMember: (id, body)    => request(`/team?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTeamMember: (id)          => request(`/team?id=${id}`, { method: 'DELETE' }),

  // Site
  getSite: ()                     => request('/site'),
  updateSiteSection: (section, body) => request(`/site?section=${section}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Site sub-lists
  getSiteList: (key)              => request(`/site/${key}`),
  addSiteListItem: (key, body)    => request(`/site/${key}`, { method: 'POST', body: JSON.stringify(body) }),
  updateSiteListItem: (key, idx, body) => request(`/site/${key}?idx=${idx}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSiteListItem: (key, idx)  => request(`/site/${key}?idx=${idx}`, { method: 'DELETE' }),
};
