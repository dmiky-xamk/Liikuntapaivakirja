import classes from "./Home.module.css";
import fi from "date-fns/esm/locale/fi/index.js";
import { Link as RouterLink } from "react-router-dom";
import {
  format,
  intervalToDuration,
  formatDuration,
  differenceInSeconds,
  differenceInWeeks,
} from "date-fns";
import {
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

export default function Home(props) {
  const formatDate = (date) => format(date, "d.M.y HH:mm");

  // Lajitellaan suoritukset päättymisajan mukaan.
  const sortedExercises = props.exercises.sort((a, b) => b.end - a.end);

  const getFormattedTotalDuration = (options) => {
    // Guard clause jos koko taulukko on tyhjä.
    if (!sortedExercises.length) return "—";

    // Ei luoda loopissa joka kerta uutta objektia.
    const today = new Date();

    let exercises = sortedExercises;

    // Filteröidään vain 7 päivän sisällä olevat
    if (options?.filter) {
      exercises = exercises.filter(
        (exercise) => differenceInWeeks(today, exercise.end) === 0
      );

      // Poistutaan välittömästi jos filteröity taulukko on tyhjä.
      if (!exercises.length) return "—";
    }

    // Lasketaan kokonaiskesto sekunneissa.
    const totalDuration = exercises.reduce(
      (acc, exercise) =>
        acc + differenceInSeconds(exercise.end, exercise.start),
      0
    );

    // Luodaan kestosta "Duration" -objekti.
    const total = intervalToDuration({ start: 0, end: totalDuration * 1000 });

    // Formatoidaan luettavaan muotoon.
    const formattedTotal = formatDuration(total, {
      delimiter: " ja ",
      format: ["hours", "minutes"],
      locale: fi,
    });

    // Palautetaan renderöitäväksi.
    return formattedTotal;
  };

  const allTimeTotal = getFormattedTotalDuration();
  const sevenDaysTotal = getFormattedTotalDuration({ filter: true });

  const exercises = sortedExercises.map((exercise) => {
    return (
      <Card key={Math.random().toString()} sx={{ minWidth: 300 }}>
        <CardContent>
          <ListItemText
            primary={exercise.description}
            secondary={`${formatDate(exercise.start)} —> ${formatDate(
              exercise.end
            )}`}
          />
        </CardContent>
      </Card>
    );
  });

  return (
    <section className={classes["section-home"]}>
      <div className={classes.flex}>
        <div className={classes.left}></div>
        <Button
          sx={{ marginBottom: 6 }}
          component={RouterLink}
          to="uusi"
          variant="contained"
        >
          Uusi aktiviteetti
        </Button>
        <div className={`${classes.flex} ${classes["flex--column"]}`}>
          <Typography>
            Yhteensä:{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {allTimeTotal}
            </Box>
          </Typography>
          <Typography>
            Viikon sisällä:{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {sevenDaysTotal}
            </Box>
          </Typography>
        </div>
      </div>
      <List sx={{ borderTop: "1px solid #eee" }}>
        <ListItem
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
            textAlign: "center",
          }}
        >
          {exercises}
        </ListItem>
      </List>
    </section>
  );
}
