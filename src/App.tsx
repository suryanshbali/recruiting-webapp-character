import { useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import Counter from './Counter';
import { ApiService } from "./ApiService";

function App() {
  const [num, setNum] = useState(0);
  const [attributeCount, setAttributeCount] = useState(
    ATTRIBUTE_LIST.reduce((acc, attr) => {
      acc[attr] = { value: 10, modifier: 0, totalSpending: 10 };
      return acc;
    }, {})
  );
  const [fullfilledClass, setFullfilledClass] = useState([]); // State to track satisfied class names
  const [selectedClass, setSelectedClass] = useState(null); // State to track selected class
  const [skillCount, setSkillCount] = useState(
    SKILL_LIST.reduce((acc, skill) => {
      acc[skill.name] = { value: 0, total: 0 };
      return acc;
    }, {})
  );
  const [totalSpendingAvailable, setTotalSpendingAvailable] = useState(0);
  const classNames = Object.keys(CLASS_LIST); // Array of class names

  useEffect(() => {
    // fetch character data from API when the app starts
    const getCharacter = async () => {
      const savedCharacter = await ApiService.getCharacter();
      if (savedCharacter) {
        setAttributeCount(savedCharacter.body.attributeCount || attributeCount);
        setSkillCount(savedCharacter.body.skillCount || skillCount);
      }
    };
    getCharacter();
  }, []);

  // post call to save characters
  const saveCharacter = async () => {
    const characterData = { attributeCount, skillCount };
    await ApiService.saveCharacter(characterData);
  };

  /**
   *
   * @returns List of class that is fullfilled by Users attribute input
   */
  const getAllEligibleClass = () => {
    const isClassEligible = (currentClass) => {
      return ATTRIBUTE_LIST.every(
        (attribute) =>
          attributeCount[attribute].value >= currentClass[attribute]
      );
    }
    return classNames.reduce((acc, curr) => {
      const currentClass = CLASS_LIST[curr];
      if (isClassEligible(currentClass)) {
        acc.push(curr);
      }
      return acc;
    }, []);
  };


  useEffect(() => {
    // Reset fullfilledClass : List of Class that is fullfilled by User's attribute Input
    setFullfilledClass(getAllEligibleClass());
    setTotalSpendingAvailable(attributeCount["Intelligence"].modifier * 4 + 10);

    // Recalculate total skill count based on the current attribute modifiers
    const updatedSkillCount = { ...skillCount };
    SKILL_LIST.forEach((skill) => {
      updatedSkillCount[skill.name].total = updatedSkillCount[skill.name].value + attributeCount[skill.attributeModifier].modifier;
    });
    setSkillCount(updatedSkillCount);


  }, [attributeCount]);

  // just to try it count given button
  const handleSetNum = (n) => {
    if (n < 0 && num === 0) return;
    setNum((prev) => prev + n);
  };

  // handler for attribute count related operations
  const handleAttributeCount = (attr, value) => {
    if (!attributeCount || typeof attributeCount !== 'object') return;

    // Calculate current total attributes
    const currentTotal = Object.keys(attributeCount).reduce((acc, key) => {
      return acc + (attributeCount[key]?.value || 0);
    }, 0);

    // Prevent increasing if total exceeds 70
    if (currentTotal + value > 70) {
      alert("Total attribute points cannot exceed 70!");
      return;
    }

    // Allow decrementing even if total is at 70
    if (attributeCount[attr].value + value < 0) return;

    // Calculate the dynamic modifier for values 12, 14, 16, etc.
    const setModifier = (newValue) =>
      newValue <= 7 ? -2 :
        newValue <= 9 ? -1 :
          Math.floor((newValue - 10) / 2);
    // Prevent the attribute value from going below 0
    // if (attributeCount[attr].value + value < 0) return;
    setAttributeCount((prevAttributes) => ({
      ...prevAttributes,
      [attr]: {
        value: prevAttributes[attr].value + value,
        modifier: setModifier(prevAttributes[attr].value + value),
      },
    }))
  }

  // handler for skill list related operations
  const handleSkillCount = (skill, value) => {
    // total of modifier and skill value
    const totalCalculate = (skill, newValue) => {
      return newValue + attributeCount[skill.attributeModifier].modifier
    }
    // Prevent the skill count from going below 0
    if (skillCount[skill.name].value + value < 0) return;
    setSkillCount((prevSkillCount) => ({
      ...prevSkillCount,
      [skill.name]: {
        value: prevSkillCount[skill.name].value + value,
        total: totalCalculate(skill, prevSkillCount[skill.name].value + value)
      },
    }))
  }

  return (
    // pre-defined, just added handler to it
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      {/* save button to store character */}
      <button style={{ cursor: "pointer", width: "150px", margin: "10px auto" }}
        onClick={saveCharacter}>Save Character</button>
      <section
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
        className="App-section">
        <Counter
          label="Value"
          value={num}
          onIncrement={() => handleSetNum(1)}
          onDecrement={() => handleSetNum(-1)}
        />

        {/* outer division */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          {/* Attributes with counter */}
          <div style={{ flex: "1", textAlign: "center" }}>
            <div style={{ margin: "12px" }}>My Attribute List</div>
            {ATTRIBUTE_LIST.map((eachAttribute) => (
              <Counter
                label={eachAttribute}
                value={attributeCount[eachAttribute].value}
                onIncrement={() => handleAttributeCount(eachAttribute, 1)}
                onDecrement={() => handleAttributeCount(eachAttribute, -1)}
                details={<span> Modifier {attributeCount[eachAttribute].modifier}</span>}
              />
            ))}
          </div>

          {/* Class list */}
          <div style={{ flex: "1", textAlign: "center" }}>
            <h2>My Class List</h2>
            {classNames.map((eachClass) => (
              <div style={{ color: fullfilledClass.includes(eachClass) ? 'red' : 'white', cursor: 'pointer' }}
                onClick={() => setSelectedClass(eachClass)}>
                {eachClass}
              </div>
            ))}

            {/* show attribute requirements for selected class */}
            <div>
              {selectedClass && (
                <div>
                  <span style={{ textDecoration: "underline", color: "red" }} onClick={() => setSelectedClass(null)}>Close</span>
                  {Object.keys(CLASS_LIST[selectedClass]).map((eachAttribute) => (
                    <div>
                      <span>
                        {eachAttribute}: {CLASS_LIST[selectedClass][eachAttribute]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills list */}
          <div style={{ flex: "1", textAlign: "center" }}>
            <h2>Skills</h2>
            Total skill points available:{totalSpendingAvailable}
            {SKILL_LIST.map((eachSkill) => (
              <>
                <Counter
                  label={eachSkill.name}
                  value={skillCount[eachSkill.name].value}
                  onIncrement={() => handleSkillCount(eachSkill, 1)}
                  onDecrement={() => handleSkillCount(eachSkill, -1)}
                  details={<span> Modifier ({eachSkill.attributeModifier}): {attributeCount[eachSkill.attributeModifier].modifier}</span>}
                />
                <span>total: {skillCount[eachSkill.name].total}</span>
              </>
            ))}
          </div>
        </div>


      </section>
    </div>
  );
}

export default App;
