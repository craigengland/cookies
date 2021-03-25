import { pubsub } from './components/pubsub';
import './main.css';

class Crumbs {
  constructor() {
    this.cookies = [];
    this.banner = null;
    this.editScreen = null;
    this.render();
  }

  render() {
    // Render the Cookie banner if analytics haven't been accepted
    // and subscribe to some events
    if (!this.getCookie('cookie_consent')) {
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

      // Set the banner property so we have access to remove it later
      this.banner = document.querySelector('.crumbs-banner');

      this.editSettings();
      pubsub.subscribe('cookiesUpdated', (cookie) => {
        window.confirm(`${cookie.name}, ${cookie.value} has been added`);
      });
    }
  }

  editSettings() {
    const editSettingsButtons = document.querySelector('.crumbs-edit-settings');
    const editScreen = `
      <div class="crumbs-edit">
        <button class="crumbs-edit-close">Close</button>
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
        <button class="crumbs-edit-accept" style="margin: 1rem 0">Set cookie preferences</button>
      </div>
    `;
    editSettingsButtons.addEventListener('click', (e) => {
      document.body.insertAdjacentHTML('beforeend', editScreen);
      this.editAccept();
      this.closeEditScreen();
      // Set the editScreen property so we have access to hide it later on.
      this.editScreen = document.querySelector('.crumbs-edit');
    });
  }

  closeEditScreen() {
    const editScreen = document.querySelector('.crumbs-edit');
    const editClose = document.querySelector('.crumbs-edit-close');
    editClose.addEventListener('click', () => {
      editScreen.remove();
    });
  }

  editAccept() {
    const editAccept = document.querySelector('.crumbs-edit-accept');
    editAccept.addEventListener('click', () => {
      const functionalCheck = document.querySelector('#functional').checked;
      const performanceCheck = document.querySelector('#performance').checked;
      const targetingCheck = document.querySelector('#targeting').checked;

      this.removeBanner(this.editScreen);
      this.removeBanner(this.banner);

      // Based on the selected checkboxes we will add the relevant cookies
      // this.addCookies('functional');
      console.log(`add preferences here to ${this.cookies}`);
    });
  }

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
  }

  addCookies(cookies) {
    let cookiesList = new Set(this.cookies);

    cookies.forEach((cookie) => {
      this.setCookie(cookie.name, cookie.value, 365);
      cookiesList.add(cookie);
      pubsub.publish('cookiesUpdated', cookie);
    });

    this.cookies = Array.from(cookiesList);
    this.setAcceptanceCookie();
    this.removeBanner(this.banner);
  }

  setAcceptanceCookie() {
    // This hides the cookie banner if we want to select some cookies
    this.setCookie('cookie_consent', true, 365);
  }

  removeBanner(banner) {
    banner.remove();
    pubsub.unsubscribe('cookiesUpdated');
  }

  setCookie(name, value, days) {
    let maxAge = '';
    if (days) {
      const time = 86400 * days;
      maxAge = `; max-age=${time}`;
    }
    document.cookie = `${name}=${value || ''}${maxAge}; path=/`;
  }
}

// This is us consuming the library in a project

document.addEventListener('DOMContentLoaded', () => {
  // A made up array of cookies that we are going to set when the
  // Accept all button is pressed
  const c = new Crumbs();
  const cookies = [
    {
      name: '_ga',
      value: 'skufksdbfk234234',
      type: 'functional',
    },
    {
      name: '_fb',
      value: 'slanfisdnifndiosnfon',
      type: 'performance',
    },
    {
      name: '_mclarity',
      value: '1231412ddwq21dqeqwe',
      type: 'targeting',
    },
  ];

  // Select the accept all button and add event listener
  const acceptCookies = document.querySelector('.crumbs-accept-all');
  if (acceptCookies) {
    acceptCookies.addEventListener('click', (e) => {
      e.preventDefault();
      c.addCookies(cookies);
    });
  }
});
