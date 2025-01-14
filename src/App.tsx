import { Authenticator } from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

const App = () => {
  //  References to the PhaserGame component (game and scene are exposed)

  // const createTodo = async () => {

  // }

  return (
    <Authenticator>
      {({ signOut, user }) => {
        if (user) {
          return <GamePage user={user} signOut={signOut} />;
        }

        return <HomePage />;
      }}
    </Authenticator>
  );
};

export default App;
