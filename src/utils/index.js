export const createConfirmationCode = () => {
  const confirmationCode = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const codeExpiration = new Date(Date.now() + 30 * 60 * 1000);

  return {
    confirmationCode,
    codeExpiration,
  };
};
