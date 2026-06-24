import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Check if configuration is set
const isConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('BURAYA_PROJECT_URL_GELECEK') &&
    !SUPABASE_ANON_KEY.includes('BURAYA_ANON_PUBLIC_KEY_GELECEK')
  );
};

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const supabaseService = {
  isConfigured,

  // --- LABORATORIES ---
  async getLaboratories() {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/laboratories?select=name`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.map(item => item.name);
      }
      console.error('Supabase getLaboratories error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getLaboratories):', e);
      return null;
    }
  },

  async addLaboratory(name) {
    if (!isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/laboratories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase addLaboratory error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (addLaboratory):', e);
      return false;
    }
  },

  // --- DEVICES ---
  async getDevices() {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
      console.error('Supabase getDevices error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getDevices):', e);
      return null;
    }
  },

  async getDeviceById(id) {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      }
      console.error('Supabase getDeviceById error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getDeviceById):', e);
      return null;
    }
  },

  async addDevice(device) {
    if (!isConfigured()) return null;
    try {
      // Ensure logs array is parsed properly
      const payload = {
        ...device,
        logs: Array.isArray(device.logs) ? device.logs : []
      };
      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : payload;
      }
      console.error('Supabase addDevice error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (addDevice):', e);
      return null;
    }
  },

  async updateDevice(id, fields) {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      }
      console.error('Supabase updateDevice error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (updateDevice):', e);
      return null;
    }
  },

  async deleteDevice(id) {
    if (!isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices?id=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase deleteDevice error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (deleteDevice):', e);
      return false;
    }
  },

  async deleteAllDevices() {
    if (!isConfigured()) return false;
    try {
      // PostgREST requires eq filters or a special header to delete all rows
      // We will perform a delete with a wildcard filter (or simply match not.is.null on id)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/devices?id=not.is.null`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase deleteAllDevices error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (deleteAllDevices):', e);
      return false;
    }
  }
};
