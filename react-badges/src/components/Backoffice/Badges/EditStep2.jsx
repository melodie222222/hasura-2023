import { Button, TextField, Tooltip, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import {
  LOAD_BADGE,
  UPDATE_REQUIREMENTS_MUTATION,
  LOAD_BADGES,
  DELETE_REQUIREMENT,
  INSERT_REQUIREMENT_MUTATION
} from "../../../containers/state/BadgesQueries";
import { useNavigate } from "react-router-dom";

const EditStep2 = ({ setCurrentStep, badgeId }) => {
  const { handleSubmit, control, setValue } = useForm();
  const navigate = useNavigate();

  const [editingField, setEditingField] = useState(-1);
  const [requirements, setRequirements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addingRequirement, setAddingRequirement] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [updateRequirements] = useMutation(UPDATE_REQUIREMENTS_MUTATION, {
    refetchQueries: [{ query: LOAD_BADGES }]
  });
  const [deleteRequirements] = useMutation(DELETE_REQUIREMENT, {
    refetchQueries: [{ query: LOAD_BADGES }]
  });
  const [addRequirements] = useMutation(INSERT_REQUIREMENT_MUTATION, {
    refetchQueries: [{ query: LOAD_BADGES }]
  });

  const { data, loading } = useQuery(LOAD_BADGE, {
    variables: {
      id: badgeId
    }
  });

  useEffect(() => {
    if (data && data.badges_versions_last) {
      const { requirements } = data?.badges_versions_last[0];
      if (requirements) {
        const parsedRequirements = JSON.parse(requirements);
        setRequirements(parsedRequirements);
        parsedRequirements.forEach((req, index) => {
          setValue(`requirements[${index}].title`, req.title);
          setValue(`requirements[${index}].description`, req.description);
          setValue(`requirements[${index}].id`, req.id);
        });
      }
    }
  }, [data, setValue]);

  const addNewRequirement = async () => {
    try {
      const { data } = await addRequirements({
        variables: {
          badgeId: badgeId,
          title: newTitle,
          description: newDescription
        }
      });
      const newRequirementId =
        data.insert_requirements_definitions.returning[0].id;
      setRequirements((prevRequirements) => [
        ...prevRequirements,
        { id: newRequirementId, title: newTitle, description: newDescription }
      ]);
      setAddingRequirement(false);
      setNewTitle("");
      setNewDescription("");
    } catch (error) {
      console.log("Error adding new requirement:", error);
    }
  };

  const deleteRequirement = async (id) => {
    try {
      await deleteRequirements({
        variables: {
          id: parseInt(id),
          badgeId: badgeId
        }
      });
      setRequirements((prevRequirements) =>
        prevRequirements.filter((req) => req.id !== id)
      );
    } catch (error) {
      console.log("Error deleting requirement:", error);
    }
  };

  const updateRequirement = async (id, formData) => {
    try {
      setIsLoading(true);

      const updatedRequirement = requirements.find((req) => req.id === id);
      console.log(updatedRequirement);
      if (updatedRequirement) {
        updatedRequirement.title = formData.title;
        updatedRequirement.description = formData.description;

        await updateRequirements({
          variables: {
            id: parseInt(id),
            badgeId: badgeId,
            newDescription: formData.description,
            newTitle: formData.title
          }
        });

        console.log(`Requirement with id ${id} updated.`);
      }

      setIsLoading(false);
      setEditingField(-1);
    } catch (error) {
      setIsLoading(false);
      console.log("Error updating requirement:", error);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const formRequirements = formData.requirements;
      for (let index = 0; index < requirements.length; index++) {
        const requirement = requirements[index];
        const formRequirement = formRequirements[index];
        await updateRequirement(requirement.id, formRequirement);
      }

      console.log("Badge and Requirements updated:", formData);
      setIsLoading(false);
      setCurrentStep(2);
      navigate("/badges");
    } catch (error) {
      setIsLoading(false);
      console.log("Error updating badge and requirements:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {requirements.map((req, index) => (
          <React.Fragment key={req.id}>
            <Controller
              name={`requirements[${index}].title`}
              control={control}
              defaultValue={req.title}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label={`Requirement ${index + 1} Title`}
                  multiline
                  rows={1}
                  {...field}
                  style={{ marginBottom: "16px", width: "100%" }}
                  disabled={editingField !== index}
                />
              )}
            />
            <Controller
              name={`requirements[${index}].description`}
              control={control}
              defaultValue={req.description}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label={`Requirement ${index + 1} Description`}
                  multiline
                  rows={2}
                  {...field}
                  style={{ marginBottom: "16px", width: "100%" }}
                  disabled={editingField !== index}
                />
              )}
            />
            {/* UPDATE REQUIREMENTS */}
            {editingField === index ? (
              <Tooltip title="Save Requirement">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setEditingField(-1);
                    setIsEditing(false); // CANT SUBMIT IF NOT SAVE
                  }}
                >
                  Save
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Edit Requirement">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setEditingField(index);
                    setIsEditing(true); // CAN SUBMIT WHEN IS SAVE
                  }}
                >
                  Edit
                </Button>
              </Tooltip>
            )}
            {/* DELETE REQUIREMENT */}
            <Tooltip title="Remove Requirement">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => deleteRequirement(req.id)}
              >
                -
              </Button>
            </Tooltip>
          </React.Fragment>
        ))}
        {addingRequirement && (
          <>
            <Controller
              name="newRequirementTitle"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label="New Requirement Title"
                  multiline
                  rows={1}
                  {...field}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ marginBottom: "16px", width: "100%" }}
                />
              )}
            />
            <Controller
              name="newRequirementDescription"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label="New Requirement Description"
                  multiline
                  rows={2}
                  {...field}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ marginBottom: "16px", width: "100%" }}
                />
              )}
            />
            <Tooltip title="Add Requirement">
              <Button
                variant="outlined"
                color="primary"
                onClick={addNewRequirement}
              >
                Add
              </Button>
            </Tooltip>
          </>
        )}

        {/* Add Button */}
        {!addingRequirement && (
          <Tooltip title="Add Requirement">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setAddingRequirement(true)}
            >
              Add
            </Button>
          </Tooltip>
        )}
        <br></br>
        <Tooltip title="Submit">
          <Button
            className="button"
            type="submit"
            variant="outlined"
            color="primary"
            disabled={isEditing}
          >
            Finish
          </Button>
        </Tooltip>
      </form>
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px"
          }}
        >
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default EditStep2;
