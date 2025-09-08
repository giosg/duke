import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientInfoService } from '../hooks/useClientInfoService';

const Cart = () => {
  const navigate = useNavigate();
  const { runCart } = useClientInfoService();
  const [cart, setCart] = useState({});

  useEffect(() => {
    // Load cart data on component mount
    runCart().then(setCart).catch(console.error);
  }, [runCart]);

  const reload = () => {
    navigate('/cart', { replace: true });
    runCart().then(setCart).catch(console.error);
  };

  return (
    <div>
      <a href="javascript:void(0);" className="pull-right" onClick={reload}>
        <i className="fa fa-fw fa-refresh"></i>
        Reload
      </a>
      
      <h3>Info</h3>
      <table className="table table-condensed">
        <tbody>
          <tr>
            <th>Currency</th>
            <th>
              <span className="text text-primary">{cart.currency}</span>
            </th>
          </tr>
          <tr>
            <th>Total price</th>
            <th>
              <span className="text text-primary">
                {cart.total_price || 0} {cart.currency}
              </span>
            </th>
          </tr>
          <tr>
            <th>Total monthly price</th>
            <th>
              <span className="text text-primary">
                {cart.monthly_total_price || 0} {cart.currency}
              </span>
            </th>
          </tr>
        </tbody>
      </table>

      <h3>Products</h3>
      <table className="table table-condensed">
        <tbody>
          {cart.products?.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>
                <span className="label label-success">{product.price}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cart;
