export function getTimelineData(data) {
  // Créer un tableau pour stocker les éléments de la timeline
  const timelineItems = [];

  // Parcourir le tableau de lauréats et construire les éléments de la timeline
  data.forEach((laureate) => {
    // Construire un identifiant unique
    const uniqueId = `${laureate.laureate_id}_${laureate.year}`;

    // Construire un objet d'élément de la timeline
    const timelineItem = {
      id: uniqueId,
      //content: `${laureate.full_name} - ${laureate.prize}`,
      content: `<div><img src="${laureate.image}" alt="${laureate.full_name}" style="max-width: 100px; max-height: 100px;">${laureate.full_name} - ${laureate.prize}</div>`,

      //start: laureate.birth_date,
      start: laureate.year,
      type: "box",
    };

    // Ajouter l'élément à la liste des éléments de la timeline
    timelineItems.push(timelineItem);
  });

  // Retourner le tableau d'éléments de la timeline
  return new vis.DataSet(timelineItems);
}
