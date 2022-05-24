import classes from "./AddExercise.module.css";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { DateTimePicker } from "@mui/lab";
import { fi } from "date-fns/locale";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { setSeconds, subSeconds } from "date-fns";

const DEFAULT_PROPERTIES = {
  ampm: false,
  okText: "OK",
  cancelText: "Peruuta",
  mask: "",
};

export default function AddExercise(props) {
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(setSeconds(new Date(), 0));
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Tarkistetaan formia lähettäessä onhan kentät täytetty.
  // Käyttäjä voi muuten palauttaa oletuksena luodun, jossa kuvaus ja aloitus tyhjinä.
  const inputsFilled = () => {
    // Jos kaikki kentät täytetty -> palautetaan tosi.
    if (startTime && endTime && description.trim()) return true;

    // Muuten luodaan virheilmoitus jokaisesta tyhjästä kentästä.
    if (!startTime) handleError("start", "noDate");
    if (!endTime) handleError("end", "noDate");
    if (!description.trim()) handleError("description", "noDescription");

    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Jos käyttäjä korjaa tyhjän päivämäärän oikeaksi, niin "onError" ei suoriteta,
    // joten ohjelma herjaisi "Syötä päivämäärä" -virhettä lähettäessä.
    // Sen takia muuttuja hyväksyy kyseisen virheilmoituksen oikeaksi.
    // Jos päivämäärässä ei oikeasti ole arvoa, "inputsFilled" estää formin lähetyksen.
    const inputsCorrect = Object.values(errors).every(
      (error) => error === "Syötä päivämäärä." || error === null
    );

    // Jos tulee virheitä, niin ei edetä pidemmälle lähetyksen kanssa.
    if (!inputsFilled() || !inputsCorrect) return;

    // Varmistaa, ettei sekuntit tule mukaan, sillä käyttäjä antaa minuutin tarkkuudella ja
    // sekuntit hämäävät yhteiskestojen laskuissa.
    const newExercise = {
      description: description,
      start: setSeconds(startTime, 0),
      end: setSeconds(endTime, 0),
    };

    // Lisätään uusi suoritus taulukkoon
    props.onNewExercise((oldExercises) => [...oldExercises, newExercise]);

    navigate("/", { replace: true });
  };

  // Tätä kutsutaan joka kerta, kun kohdataan virhe, tai kun se on korjattu (tällöin error === null).
  const handleError = (name, error) => {
    let errorMessage = "";

    switch (error) {
      case "maxTime":
        errorMessage = "Ajan oltava aiemmin kuin päättymisaika.";
        break;
      case "invalidDate":
        errorMessage = "Virheellinen päivämäärä.";
        break;
      case "maxDate":
        errorMessage = "Päivämäärä ei voi olla päättymisajan jälkeen.";
        break;
      case "minDate":
        errorMessage = "Päivämäärä ei voi olla liikaa menneisyydessä.";
        break;
      case "noDate":
        errorMessage = "Syötä päivämäärä.";
        break;
      case "noDescription":
        errorMessage = "Kuvaus ei voi olla tyhjä.";
        break;
      case null:
        errorMessage = null;
        break;
      default:
        errorMessage = "Odottamaton virhe";
        break;
    }

    setErrors((errors) => {
      return { ...errors, [name]: errorMessage };
    });
  };

  // Tarkistetaan, ettei kuvaus ole tyhjä.
  const handleDescriptionChange = (event) => {
    if (!event.target.value.trim()) handleError("description", "noDescription");
    else if (errors.description === "Kuvaus ei voi olla tyhjä.")
      handleError("description", null);

    setDescription(event.target.value);
  };

  return (
    <section className={classes["section-add"]}>
      <h1 className="heading-primary">Lisää uusi liikuntasuoritus</h1>
      <form className={classes["add-form"]} onSubmit={handleSubmit}>
        <TextField
          name="description"
          value={description}
          className={classes["add-description"]}
          label="Suorituksen kuvaus *"
          onChange={handleDescriptionChange}
          error={Boolean(errors.description)}
          helperText={errors.description}
        ></TextField>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={fi}>
          <DateTimePicker
            className={classes["start-date"]}
            label="Alkamisajankohta *"
            value={startTime}
            maxDateTime={subSeconds(endTime, 1)}
            onChange={(newTime) => setStartTime(newTime)}
            onError={handleError.bind(null, "start")}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(errors.start)}
                helperText={errors.start}
              />
            )}
            {...DEFAULT_PROPERTIES}
          />
          <DateTimePicker
            className={classes["end-date"]}
            label="Päättymisajankohta *"
            value={endTime}
            maxDateTime={new Date()}
            onChange={(newTime) => setEndTime(newTime)}
            onError={handleError.bind(null, "end")}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(errors.end)}
                helperText={errors.end}
              />
            )}
            {...DEFAULT_PROPERTIES}
          />
        </LocalizationProvider>
        <Button
          className={`${classes.send} ${classes.btn}`}
          variant="contained"
          type="submit"
        >
          Lisää
        </Button>
        <Button
          className={`${classes.cancel} ${classes.btn}`}
          variant="outlined"
          component={RouterLink}
          to="/"
        >
          Peruuta
        </Button>
      </form>
    </section>
  );
}
