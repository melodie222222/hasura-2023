import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { LOAD_BADGES } from "../Badges/Graphql/Queries";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { DELETE_BADGE } from "./Graphql/Mutations";

const Badges = () => {
  const { data } = useQuery(LOAD_BADGES);
  // const { badges_definitions } = data ? data : [];

  const [badges, setBadges] = useState([]);
  const [deleteBadge, { loading, error }] = useMutation(DELETE_BADGE, {
    refetchQueries: [{ query: LOAD_BADGES }]
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      setBadges(data.badges_definitions);
    }
  }, [data]);

  const deleteBadgeHandler = (id) => {
    deleteBadge({
      variables: {
        id: id
      }
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      {badges &&
        badges.map((badge, index) => {
          return (
            <div key={index}>
              <h1> {badge.title}</h1>
              <p>{badge.description}</p>
              <ol>
                {badge.badges_definitions_requirements_definitions.map(
                  (requirement, index) => (
                    <li key={index}>{requirement.description}</li>
                  )
                )}
              </ol>
              <Button onClick={() => deleteBadgeHandler(badge.id)}>
                Delete
              </Button>
            </div>
          );
        })}
      <Button>
        <Link to={"/create"}>Add New</Link>
      </Button>
    </div>
  );
};

export default Badges;
