export const getManifestoTopics = (lvl: string): string[] => {
  switch (lvl) {
    case "country":
      return [
        "Agriculture",
        "Micro, Small, and Medium Enterprises (MSMEs)",
        "Housing and Settlement",
        "Healthcare",
        "Digital Superhighway and Creative Economy",
        "Social Protection",
        "Women’s Agenda",
        "Education",
        "Infrastructure",
        "Water and Sanitation",
        "Environment and Climate Change",
        "Governance",
      ];
    case "county":
      return [
        "Agriculture and Food Security",
        "Infrastructure Development",
        "Healthcare Access and Quality",
        "Education and Youth Empowerment",
        "Economic Empowerment and MSMEs",
        "Environmental Sustainability and Climate Change",
        "Governance and Devolution",
      ];
    case "constituency":
      return [
        "Education",
        "Infrastructure",
        "Health",
        "Economic Empowerment",
        "Water and Sanitation",
        "Youth and Sports Development",
      ];
    case "ward":
      return [
        "Sanitation",
        "Youth Empowerment",
        "Roads",
        "Community Development",
        "Healthcare Access",
        "Local Economic Initiatives",
      ];
    default:
      return [];
  }
};
