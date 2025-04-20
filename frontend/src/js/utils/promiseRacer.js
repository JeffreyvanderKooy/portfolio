const promiseRacer = (
  seconds,
  msg = 'Server timeout. Please try again later.'
) => {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        reject({
          ok: false,
          message: msg,
        }),
      seconds * 1000
    )
  );
};

export default promiseRacer;
