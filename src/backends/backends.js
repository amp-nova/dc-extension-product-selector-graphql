import {SFCC} from './SFCC';
import {Hybris} from './Hybris';
import {CommerceTools} from './CommerceTools';
import {BigCommerce} from './BigCommerce';

export const backends = {
  SFCC: 'sfcc',
  HYBRIS: 'hybris',
  COMMERCETOOLS: 'commercetools',
  BIGCOMMERCE: 'bigcommerce'
};

export const getBackend = (params) => {
  switch (params.backend) {
    case backends.HYBRIS:
      return new Hybris(params);
    case backends.COMMERCETOOLS:
      return new CommerceTools(params);
    case backends.BIGCOMMERCE:
      return new BigCommerce(params);
    case backends.SFCC:
    default:
      return new SFCC(params);
  }
}