import { pubsub } from './components/pubsub';

const Crumbs = {
  cookies: [],
  render() {
    pubsub.subscribe('addCookie', Crumbs.addCookie);
    pubsub.subscribe('cookiesUpdated', (cookie) => {
      window.confirm(`${cookie.name}, ${cookie.value} has been added`);
    });
  },

  addCookie(cookie) {
    // let cookiesList = new Set(Crumbs.cookies);
    // cookiesList.add(cookie);
    // Crumbs.cookies = Array.from(cookiesList);

    Crumbs.cookies.push(cookie);
    Crumbs.setCookie(cookie.name, cookie.value, 365);

    pubsub.publish('cookiesUpdated', cookie);
    console.log(Crumbs.cookies);
  },

  setCookie(name, value, days) {
    let maxAge = '';
    if (days) {
      const time = 86400 * days;
      maxAge = `; max-age=${time}`;
    }
    document.cookie = `${name}=${value || ''}${maxAge}; path=/`;
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Crumbs.render();

  const button = document.querySelector('#add-cookie');
  button.addEventListener('click', () => {
    Crumbs.addCookie({
      name: '_ga',
      value: 'sdifnsdf8729374892374',
    });
  });
});
