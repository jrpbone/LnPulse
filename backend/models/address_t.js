module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "ADDRESS_T",
    {
      address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      houseNo: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },  
      street_barangay: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city_municipality: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "Ligao City",
      },
      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "Albay",
      },
    },
    {
      tableName: "ADDRESS_T",
    }
  );

  return Address;
};
