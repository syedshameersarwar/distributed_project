export const getHostConnection = (host, master, slave_a, slave_b) => {
  switch (host) {
    case "MASTER":
      return master;
    case "SLAVE_A":
      return slave_a;
    case "SLAVE_B":
      return slave_b;
    default:
      return master;
  }
};

export const getConnectionOrder = (
  master,
  slave_a,
  slave_b,
  source,
  from_master
) => {
  if (!from_master) return [slave_a, slave_b, null];
  if (source === "MASTER") return [master, slave_a, slave_b];
  else if (source === "SLAVE_A") return [slave_a, master, slave_b];
  else if (source === "SLAVE_B") return [slave_b, master, slave_a];
};

export const extractToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }
  return null;
};

export const promisify = async (connectionObj, query, args) => {
  const promise = new Promise((resolve, reject) => {
    connectionObj.query(query, args, (err, result) => {
      if (err) reject({ err, isError: true });
      resolve({ result, isError: false });
    });
  });

  const result = await promise;
  //console.log(JSON.parse(JSON.stringify(result)));
  return JSON.parse(JSON.stringify(result));
};

export const generateToken = (user, pass) => {
  if (user === "master" && pass === "abcd.123")
    return {
      token: "SomeMasterToken",
      valid: true,
      isMaster: true
    };
  else if ((user === "slave_a" || user === "slave_b") && pass === "abcd.123")
    return {
      token: "SomeSlaveToken",
      valid: true,
      isMaster: false
    };
  return { token: null, valid: false };
};
