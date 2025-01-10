import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

 const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, 
  token: process.env.SANITY_API_TOKEN,
});

export default client;