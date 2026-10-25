import { Route, Routes } from 'react-router';
import { CheckoutLayout, Layout } from './components/Layout';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Orders } from './pages/Orders';
import { ProductPage } from './pages/ProductPage';
import { Search } from './pages/Search';
import { SignIn } from './pages/SignIn';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="s" element={<Search />} />
        <Route path="dp/:id" element={<ProductPage />} />
        <Route path="carrinho" element={<Cart />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<CheckoutLayout />}>
        <Route path="checkout" element={<Checkout />} />
      </Route>
      <Route path="login" element={<SignIn />} />
    </Routes>
  );
}
