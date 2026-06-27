import axios from 'axios';
import { API_BASE as GLOBAL_API_BASE } from './constants';

const API_BASE = `${GLOBAL_API_BASE}/api`;

export const fetchIndianFestivals = async (year, month) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching festivals for ${month} ${year}...`);

    const response = await axios.get(
      `${API_BASE}/festival/gemini-festivals/?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Festival response:', response.data);

    if (response.data.success) {
      return response.data.festivals || {};
    }
    return {};

  } catch (error) {
    console.error('❌ Failed to fetch festivals:', error.response?.data || error.message);
    // Return empty object instead of throwing to prevent UI crash
    return {};
  }
};

export const generateFestivalGreetings = async (festivalName, date, tone = "Happy") => {
  try {
    const token = localStorage.getItem('token');
    console.log(`🎨 Generating greetings for ${festivalName}...`);

    const response = await axios.post(
      `${API_BASE}/festival/greeting/`,
      {
        festival_name: festivalName,
        tone: tone
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Greetings response:', response.data);

    if (response.data.success) {
      return response.data.messages || [];
    }
    throw new Error(response.data.error || 'Failed to generate greetings');

  } catch (error) {
    console.error('❌ Failed to generate greetings:', error.response?.data || error.message);
    throw error;
  }
};