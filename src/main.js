import { pubsub } from './components/pubsub';
import './main.css';

const Crumbs = {
  cookies: [],
  state: {
    functional: false,
    performance: false,
    targeting: false,
  },
  render() {
    // Render the Cookie banner if analytics haven't been accepted
    // and subscribe to some events

    if (!Crumbs.getCookie('cookie_consent')) {
      // Create the banner itself as a template literal and add it
      // to the DOM, at the end of the body
      const cookieBanner = `
        <div class="crumbs-banner">
          <div class="">
            <h4>Cookie Banner</h4>
            <p>Something about accepting cookies</p>
          </div>
          <div class="">
            <button class="crumbs-edit-settings">Edit settings</button>
            <button class="crumbs-accept-all">Accept Cookies</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', cookieBanner);
      Crumbs.editSettings();
      pubsub.subscribe('cookiesUpdated', (cookie) => {
        window.confirm(`${cookie.name}, ${cookie.value} has been added`);
      });
    }
  },

  editSettings() {
    const editSettingsButtons = document.querySelector('.crumbs-edit-settings');
    const editScreen = `
      <div class="crumbs-edit">
        <h4>Edit cookie settings</h4>
        <p>Check the cookies you want to accept</p>
        <div>
          <label for="functional">Functional</label>
          <input type="checkbox" id="functional" />
        </div>
        <div>
          <label for="performance">Performance</label>
          <input type="checkbox" id="performance" />
        </div>
        <div>
          <label for="targeting">Targeting</label>
          <input type="checkbox" id="targeting" />
        </div>
        <button class="crumbs-edit-accept>Set cookie preferences</button>
      </div>
    `;
    editSettingsButtons.addEventListener('click', (e) => {
      document.body.insertAdjacentHTML('beforeend', editScreen);
    });
  },

  getCookie(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      const c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return '';
  },

  acceptAll(cookies) {
    let cookiesList = new Set(Crumbs.cookies);

    cookies.forEach((cookie) => {
      Crumbs.setCookie(cookie.name, cookie.value, 365);
      cookiesList.add(cookie);
      pubsub.publish('cookiesUpdated', cookie);
    });

    Crumbs.cookies = Array.from(cookiesList);

    Crumbs.state = {
      functional: true,
      performance: true,
      targeting: true,
    };

    // Set the overall consent to true if we accept all
    Crumbs.setCookie('cookie_consent', true, 1);
    Crumbs.removeBanner();
  },

  removeBanner() {
    const cookieBanner = document.querySelector('.crumbs-banner');
    cookieBanner.remove();
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

// This is us consuming the library in a project

document.addEventListener('DOMContentLoaded', () => {
  Crumbs.render();

  // A made up array of cookies that we are going to set when the
  // Accept all button is pressed
  const cookies = [
    {
      name: '_ga',
      value: 'skufksdbfk234234',
    },
    {
      name: '_fb',
      value: 'slanfisdnifndiosnfon',
    },
  ];

  // Select the accept all button and add event listener
  const acceptCookies = document.querySelector('.crumbs-accept-all');
  if (acceptCookies) {
    acceptCookies.addEventListener('click', (e) => {
      e.preventDefault();
      Crumbs.acceptAll(cookies);
    });
  }
});
