// Pages
import HomeView from './pages/home';
import AboutView from './pages/about';
import FirebaseView from './pages/firebase-example';
import MapboxView from './pages/mapbox-example';
import AddKotView from './pages/add-kot';
import DetailView from './pages/detail';
import MessagesView from './pages/messages';
import FavoritesView from './pages/favs';
import ManageView from './pages/manage-kots';

export default [
  { path: '/', view: HomeView },
  { path: '/about', view: AboutView },
  { path: '/firebase', view: FirebaseView },
  { path: '/mapbox', view: MapboxView },
  { path: '/addkot', view: AddKotView },
  { path: '/detail', view: DetailView },
  { path: '/messages', view: MessagesView },
  { path: '/favs', view: FavoritesView },
  { path: '/manage', view: ManageView },
];
