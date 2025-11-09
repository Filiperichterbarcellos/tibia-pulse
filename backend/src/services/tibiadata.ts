import axios from 'axios'
import { endpoints } from '../constants'

export class TibiaDataClient {
  private static base = endpoints.TIBIADATA_BASE_URL

  static async character(name: string) {
    try {
      const url = `${this.base}/character/${encodeURIComponent(name)}`
      console.log('[tibiadata] GET', url)

      const { data } = await axios.get(url, { timeout: 6000 })

      // formatos possíveis
      if (data?.characters?.data && !data?.characters?.error) {
        return data.characters.data
      }
      if (data?.character) {
        return data.character
      }
      return null
    } catch (err) {
      console.error('[tibiadata] fetch error', err)
      return null
    }
  }
}
