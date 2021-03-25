import { EventEmitter } from 'events';
import { pubsub } from './components/pubsub';
import './main.css';

class Crumbs extends EventEmitter {
  constructor() {
    super();
    this.accepted = ['analytics', 'functional', 'targeting'];
    this.banner = null;
    this.editScreen = null;
    this.render();
  }

  render() {
    // Render the Cookie banner if the cookie_consent cookie isn't true
    if (!this.getCookie('cookie_consent') === true) {
      // Create the banner itself as a template literal and add it
      // to the DOM, at the end of the body
      const cookieBanner = `
        <div class="crumbs-banner">
          <div>
            <h4>Cookie Banner</h4>
            <p>Something about accepting cookies</p>
          </div>
          <div>
            <button class="crumbs-edit-settings">Edit settings</button>
            <button class="crumbs-accept-all">Accept Cookies</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', cookieBanner);

      // As we have created this we can have access to it now for removing later
      this.banner = document.querySelector('.crumbs-banner');

      // Clicking on accept all sets all the cookies and hides the banner
      const acceptCookies = document.querySelector('.crumbs-accept-all');
      acceptCookies.addEventListener('click', () => {
        // As we are accepting all, we can send back everything
        this.setAcceptanceCookie();
        this.removeBanner(this.banner);
        this.emit('onSave', this.accepted);
      });

      this.editSettings();
      pubsub.subscribe('cookiesUpdated', (cookie) => {
        window.confirm(`${cookie.name}, ${cookie.value} has been added`);
      });
    }
  }

  editSettings() {
    // Build the edit modal
    const editSettingsButtons = document.querySelector('.crumbs-edit-settings');
    const editScreen = `
      <div class="crumbs-edit" role="dialog" aria-labelledby="crumbs-dialog-title" aria-describedby="crumbs-dialog-descrption">
        <button class="crumbs-edit-close">Close</button>
        <h4 id="crumbs-dialog-title">Edit cookie settings</h4>
        <p id="crumbs-dialog-description">Check the cookies you want to accept</p>
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

    // Add the edit cookies modal to the DOM when selected
    editSettingsButtons.addEventListener('click', () => {
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
      const checkboxes = Array.from(
        document.querySelectorAll('input[type="checkbox"]')
      );
      const accepted = checkboxes
        .filter((checkbox) => {
          if (checkbox.checked === true) {
            return checkbox;
          }
        })
        .map((c) => {
          return c.id;
        });

      this.removeBanner(this.editScreen);
      this.removeBanner(this.banner);

      // Based on the selected checkboxes we will add the relevant cookies
      // window.confirm(`Add the relevant cookies`);
      this.emit('onSave', accepted);
      this.setAcceptanceCookie();
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

  setAcceptanceCookie() {
    // This cookie determines if the banner should be hidden or not.
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
  c.on('onSave', (preferences) => {
    alert(preferences);
  });
});
