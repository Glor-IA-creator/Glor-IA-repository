export const handleAuthError = (response, navigate) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    navigate('/?expired=1');
    return true;
  }
  return false;
};

export const handleAxiosAuthError = (error, navigate) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    navigate('/?expired=1');
    return true;
  }
  return false;
};
