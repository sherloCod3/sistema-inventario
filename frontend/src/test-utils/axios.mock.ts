import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

export const configureMockAxios = () => {
  mockedAxios.create.mockReturnThis();
  mockedAxios.get.mockResolvedValue({ 
    data: { 
      items: [], 
      totalPages: 0 
    } 
  });
  mockedAxios.post.mockResolvedValue({ data: {} });
  mockedAxios.put.mockResolvedValue({ data: {} });
  mockedAxios.delete.mockResolvedValue({ data: {} });

  return mockedAxios;
};

export default configureMockAxios;