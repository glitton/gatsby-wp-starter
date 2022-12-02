if (process.env.STAGING) {
  require("dotenv").config({
    path: `.env.staging`,
  })
} else {
  require("dotenv").config({
    path: `.env.${process.env.NODE_ENV}`,
  })
}

const siteUrl = `https://www.planful.com`

module.exports = {
  siteMetadata: {
    title: `Planful`,
    description: `F P & A`,
    author: `@vaibhavagarr`,
    siteUrl: `https://www.planful.com/`,
  },
  plugins: [
    // `@wardpeet/gatsby-plugin-performance-wip`,
    {
      resolve: "gatsby-plugin-google-tagmanager",
      options: {
        id: "GTM-KXKZMBF",

        // // Include GTM in development.
        // //
        // // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,

        // // datalayer to be set before GTM is loaded
        // // should be an object or a function that is executed in the browser
        // //
        // // Defaults to null
        defaultDataLayer: { platform: "gatsby" },

        // // Specify optional GTM environment details.
        // gtmAuth: "T7y1LXBZGuIbsa0sdb_20g",
        // gtmPreview: "env-2",
        // // dataLayerName: "YOUR_DATA_LAYER_NAME",

        // // Name of the event that is triggered
        // // on every Gatsby route change.
        // //
        // // Defaults to gatsby-route-change
        routeChangeEventName: "gatsby-route-change",
        // // Defaults to false
        enableWebVitalsTracking: true,
        // // Defaults to https://www.googletagmanager.com
        // // selfHostedOrigin: "YOUR_SELF_HOSTED_ORIGIN",
      },
    },
    // {
    //   resolve: `gatsby-plugin-google-analytics`,
    //   options: {
    //     // The property ID; the tracking code won't be generated without it
    //     trackingId: "UA-3597346-1",
    //     // Defines where to place the tracking script - `true` in the head and `false` in the body
    //     head: true,
    //     // Setting this parameter is optional
    //     anonymize: true,
    //     // Setting this parameter is also optional
    //     respectDNT: true,
    //     // Avoids sending pageview hits from custom paths
    //     // exclude: ["/preview/**", "/do-not-track/me/too/"],
    //     // Delays sending pageview hits on route update (in milliseconds)
    //     pageTransitionDelay: 0,
    //     // Enables Google Optimize using your container Id
    //     // optimizeId: "YOUR_GOOGLE_OPTIMIZE_TRACKING_ID",
    //     // Enables Google Optimize Experiment ID
    //     // experimentId: "YOUR_GOOGLE_EXPERIMENT_ID",
    //     // Set Variation ID. 0 for original 1,2,3....
    //     // variationId: "YOUR_GOOGLE_OPTIMIZE_VARIATION_ID",
    //     // Defers execution of google analytics script after page load
    //     defer: false,
    //     // Any additional optional fields
    //     sampleRate: 5,
    //     siteSpeedSampleRate: 10,
    //     // cookieDomain: "example.com",
    //     // defaults to false
    //     enableWebVitalsTracking: true,
    //   },
    // },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-perf-budgets`,
    `gatsby-plugin-webpack-bundle-analyser-v2`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allWordpressPost } }) => {
              return allWordpressPost.nodes.map(node => {
                return Object.assign({}, node, {
                  description: node.excerpt,
                  date: node.date,
                  url: site.siteMetadata.siteUrl + "/blog/" + node.slug,
                  guid: site.siteMetadata.siteUrl + "/blog/" + node.slug,
                  custom_elements: [{ "content:encoded": node.content }],
                })
              })
            },
            query: `
            {
              allWordpressPost(sort: {order: DESC, fields: date}) {
                nodes {
                  date
                  title
                  content
                  excerpt
                  slug
                }
              }
            }
            `,
            output: "/rss.xml",
            title: "Planful's RSS Feed",
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            // match: "^/blog/",
            // optional configuration to specify external rss feed, such as feedburner
            link: "https://planful.com/feed/",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-gatsby-cloud`,
      options: {
        allPageHeaders: [
          "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        ],
        mergeSecurityHeaders: false,
        headers: {
          "/*": [
            "Content-Security-Policy: frame-ancestors https://app.zoominfo.com",
            "Access-Control-Allow-Origin: https://app.zoominfo.com",
            "X-Content-Type-Options: nosniff",
            "X-Frame-Options: ALLOW-FROM https://app.zoominfo.com",
            "X-XSS-Protection: 1; mode=block",
          ],
        },
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: ["/hello-world/"],
        query: /* GraphQL */ `
          {
            allSitePage {
              nodes {
                path
              }
            }
            allWordpressContentNode(
              filter: {
                nodeType: {
                  in: [
                    "Post"
                    "Resource"
                    "News"
                    "Event"
                    "Usecase"
                    "Customerstory"
                    "Page"
                  ]
                }
              }
            ) {
              nodes {
                ... on WordpressPost {
                  modifiedGmt
                  uri
                }
                ... on WordpressResource {
                  modifiedGmt
                  uri
                }
                ... on WordpressNews {
                  id
                  modifiedGmt
                  uri
                }
                ... on WordpressEvent {
                  modifiedGmt
                  uri
                }
                ... on WordpressUsecase {
                  modifiedGmt
                  uri
                }
                ... on WordpressCustomerstory {
                  modifiedGmt
                  uri
                }
                ... on WordpressPage {
                  modifiedGmt
                  uri
                }
              }
            }
          }
        `,
        resolveSiteUrl: () => siteUrl,
        resolvePages: ({
          allSitePage: { nodes: allPages },
          allWordpressContentNode: { nodes: allWordpressNodes },
        }) => {
          const wordpressNodeMap = allWordpressNodes.reduce((acc, node) => {
            const { uri } = node
            acc[uri] = node

            return acc
          }, {})

          return allPages.map(page => {
            return { ...page, ...wordpressNodeMap[page.path] }
          })
        },
        serialize: ({ path, modifiedGmt }) => {
          return {
            url: path,
            lastmod: modifiedGmt,
          }
        },
      },
    },
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          quality: 100,
          placeholder: `none`,
          backgroundColor: `transparent`,
        },
      },
    },
    {
      resolve: `gatsby-transformer-sharp`,
      options: {
        // The option defaults to true
        checkSupportedExtensions: false,
        placeholder: `none`,
        backgroundColor: `transparent`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/favicon-32x32.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: "gatsby-source-marketo",
      options: {
        munchkinId: "323-LTC-321",
        clientId: "d4284498-0fb6-4a65-8386-6f77a45f4a65",
        clientSecret: "jeYzP8dnS9YWJaE1FHh9c8t1BUqP47mu",
      },
    },
    {
      resolve: "gatsby-source-wordpress",
      options: {
        url: process.env.GATSBY_WORDPRESS_URL,
        debug: {
          graphql: {
            writeQueriesToDisk: true,
          },
        },
        type: {
          MediaItem: {
            createFileNodes: false,
            excludeFieldNames: [
              `date`,
              `dateGmt`,
              `description`,
              `desiredSlug`,
              `enclosure`,
              `guid`,
              `isTermNode`,
              `ancestors`,
              `caption`,
              `children`,
              `commentCount`,
              `commentStatus`,
              `comments`,
              `ancestors`,
              `caption`,
              `children`,
              `commentCount`,
              `commentStatus`,
              `comments`,
              `parent`,
              `parentDatabaseId`,
              `parentId`,
              `seo`,
              `slug`,
              `srcSet`,
              `template`,
            ],
          },
        },
        schema: {
          perPage: 20, // default set to 100
          requestConcurrency: 5, // default set to 10
          typePrefix: "Wordpress",
          previewRequestConcurrency: 2, // default set to 5
          timeout: 6000000,
        },
      },
    },
    `gatsby-plugin-scroll-reveal`,
    // {
    //   resolve: 'gatsby-plugin-drift',
    //   options: {
    //     appId: 'mhrwfbibuzb5',
    //   },
    // },
    // {
    //   resolve: "gatsby-plugin-load-script",
    //   options: {
    //     src: "/drift.js", // Change to the script filename
    //   },
    // },
  ],
}
