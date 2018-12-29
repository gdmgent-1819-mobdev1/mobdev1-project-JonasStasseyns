// Pages
import HomeView from './pages/home';
import AboutView from './pages/about';
import FirebaseView from './pages/firebase-example';
import MapboxView from './pages/mapbox-example';
import AddKotView from './pages/add-kot';
import DetailView from './pages/detail';
import MessagesView from './pages/messages';

export default [
  { path: '/', view: HomeView },
  { path: '/about', view: AboutView },
  { path: '/firebase', view: FirebaseView },
  { path: '/mapbox', view: MapboxView },
  { path: '/addkot', view: AddKotView },
  { path: '/detail', view: DetailView },
  { path: '/messages', view: MessagesView },
];
