import { ProductSelectorError } from '../ProductSelectorError';
import { setContext } from '@apollo/client/link/context';
import { createHttpLink, ApolloClient, InMemoryCache, gql } from '@apollo/client';
import _ from 'lodash';

let mapProduct = prod => ({
  id: prod.id,
  name: prod.name,
  image: _.get(_.first(prod.variants), 'defaultImage.url')
})

export class GraphQLBackend {
  client;
  constructor({ backendId, graphqlUrl }) {
    console.log(`GraphQL init ${backendId}`)
    const httpLink = createHttpLink({
      uri: graphqlUrl
    })

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          'x-pbx-backend-key': backendId,
        }
      }
    });

    this.client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    });
  }

  async getItemById(id) {
    if (this.client) {
      let results = await this.client.query({
        query: gql`
          query productById {
            product(id:"${id}") {
              id
              name
              variants {
              defaultImage {
                url
              }
            }
          }
        }`
      })
      return mapProduct(results.data.product)
    }
  }

  async getItems(state, filterIds = []) {
    try {
      if (!filterIds.length) {
        return [];
      }

      return await Promise.all(filterIds.map(await _.bind(this.getItemById, this)))
    } catch (e) {
      console.error(e);
      throw new ProductSelectorError('Could not get items', ProductSelectorError.codes.GET_SELECTED_ITEMS);
    }
  }

  async search(state) {
    const {
      searchText,
      page,
      PAGE_SIZE
    } = state;

    let results = await this.client.query({
      query: gql`
        query products {
          products(keyword:"${searchText}",limit:${PAGE_SIZE},offset:${page.curPage * PAGE_SIZE}) {
            meta {
              total
            }
            results {
              id
              name
              variants {
                defaultImage {
                  url
                }
              }
            }
          }
        }
      `
    })

    let items = _.map(results.data.products.results, mapProduct)
    return {
      items,
      page: {
        numPages: Math.ceil(results.data.products.meta.total / PAGE_SIZE),
        curPage: page.curPage,
        total: results.data.products.meta.total
      }
    };
  }

  exportItem(item) {
    return item.id;
  }
}
