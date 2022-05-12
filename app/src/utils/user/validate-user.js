export const userIsCurrentPlayer = (address1, address2) => {
  let userIsValid = false;
  if (address1 && address2) {
    userIsValid = address1.toUpperCase() === address2.toUpperCase();
  }
  return userIsValid;
};
