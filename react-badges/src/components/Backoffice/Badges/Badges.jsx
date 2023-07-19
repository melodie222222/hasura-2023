import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  LOAD_BADGES,
  DELETE_BADGE
} from "../../../containers/state/BadgesQueries";
import { Box, Button, Card, Typography, Fab } from "@mui/material";
import { Link } from "react-router-dom";

const Badges = () => {
  const { data } = useQuery(LOAD_BADGES);
  const [badges, setBadges] = useState([]);
  const [deleteBadge, { loading, error }] = useMutation(DELETE_BADGE, {
    refetchQueries: [{ query: LOAD_BADGES }]
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      setBadges(data.badges_versions_last);
    }
  }, [data]);

  console.log(data);

  const deleteBadgeHandler = (id) => {
    deleteBadge({
      variables: {
        badge_def_id: id,
        is_deleted: true
      }
    });
    console.log(id);
   
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <Box>
        {badges &&
          badges.map((badge, index) => {
            return (
              <Card
                key={index}
                sx={{
                  padding: "16px",
                  marginBottom: "16px",
                  marginTop: "16px",
                  marginLeft: "16px",
                  marginRight: "16px"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "space-evenly"
                  }}
                >
                  <Typography variant="h1"> {badge.title}</Typography>
                  <Typography>{badge.description}</Typography>
                  {/* <ol>
                {badge.requirements.map((requirement, index) => (
                  <li key={index}>{requirement.description}</li>
                ))}
              </ol> */}
                </Box>
                <Button onClick={() => deleteBadgeHandler(badge.id)}>
                  Delete
                </Button>
              </Card>
            );
          })}
        <Fab
          component={Link}
          to="/create"
          color="primary"
          aria-label="add"
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px"
          }}
        >
          <h1>+</h1>
        </Fab>
      </Box>
    </div>
  );
};

export default Badges;
