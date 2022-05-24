import "@fontsource/roboto";
import { Fragment, useState } from "react";
import { Routes, Route } from "react-router";
import AddExercise from "./components/pages/AddExercise";
import Home from "./components/pages/Home";

function App() {
  const [exercises, setExercises] = useState([]);

  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home exercises={exercises} />} />
        <Route
          path="uusi"
          element={<AddExercise onNewExercise={setExercises} />}
        />
        <Route />
      </Routes>
    </Fragment>
  );
}

export default App;
