import SuperTokens from "supertokens-react-native";

SuperTokens.init({
  apiDomain: `http://${process.env.MACHINE_IP}:4000`,
  apiBasePath: "/api/auth",
});
