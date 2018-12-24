import Navigo from 'navigo';
import handlebars, { compile } from 'handlebars';
import './styles/main.sass';

import routes from './routes';

// Partials
const header = require('./partials/header.handlebars');
const footer = require('./partials/footer.handlebars');
const menu = require('./partials/menu.handlebars');

// Register the partial components
handlebars.registerPartial('header', compile(header)({ title: 'Just another web app' }));
handlebars.registerPartial('footer', compile(footer)({ text: 'Template made with love by GDM Ghent' }));
handlebars.registerPartial('menu', compile(menu));

// Router logic to load the correct template when needed
const router = new Navigo(window.location.origin, true);

routes.forEach((route) => {
  router.on(route.path, () => {
    route.view();
    router.updatePageLinks();
  });
});

// This catches all non-existing routes and redirects back to the home
router.notFound(() => {
  router.navigate('/');
});
router.resolve();
window.onload = () => {
  router.navigate(window.location.hash.split('/')[1]);
};
