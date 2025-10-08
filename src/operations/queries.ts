import { gql } from '@apollo/client/core'

export const GetLocations = gql`
      query GetLocations {
        locations {
          id
          name
          description
          photo
        }
      }
    `
