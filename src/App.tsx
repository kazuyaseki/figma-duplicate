import * as React from 'react';
import styled from 'styled-components';

type ComponentItemType = {
  id: string;
  name: string;
  value: string;
};

type TextValue = { [key in string]: string };

const Layout = styled.div`
  min-width: 400px;
  min-height: 320px;
  padding: 20px;

  * {
    /* font-family: 'Inter', sans-serif; */
    font-weight: 400;
    color: #333;
  }
`;

const TextInputList = styled.ul`
  padding: 0;
  margin-top: 20px;
`;

const Row = styled.li`
  display: flex;
  list-style: none;

  &:not(:last-child) {
    margin-bottom: 8px;
  }

  > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const NumberOfElements = styled.div`
  > span {
    font-size: 16px;
    font-family: monospace;
  }
`;

const Select = styled.select`
  margin-left: 4px;
  height: 24px;
  font-size: 14px;
`;

const DuplicateButton = styled.button`
  margin-top: 20px;
  background-color: #0093fe;
  color: #fff;
  font-family: system-ui;
  font-size: 14px;
  letter-spacing: 1px;
  font-weight: bold;
  padding: 8px;
  border: none;
  border-radius: 8px;
`;

const numberOfElementsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const TextInputCell = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextInputLabel = styled.label`
  color: #aaa;
  font-size: 12px;
  font-family: monospace;
  margin-bottom: 4px;
`;

const TextInput = styled.input`
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 4px 8px;
`;

function constructTextValueFromOriginal(
  originalValues: ComponentItemType[]
): TextValue {
  return originalValues.reduce(
    (prev, current) => ({ ...prev, [current.id]: current.value }),
    {}
  );
}

function initializeTextArray(
  current: TextValue[],
  newLength: number,
  originalValues: ComponentItemType[]
) {
  const copy = [...current];

  if (current.length < newLength) {
    const defalutValue = constructTextValueFromOriginal(originalValues);

    for (let i = current.length; i < newLength; i++) {
      copy.push(defalutValue);
    }

    return copy;
  }

  return copy.slice(0, newLength);
}

export const App = () => {
  const [numberOfElements, setNumberOfElements] = React.useState(1);
  const [textNodes, setComponents] = React.useState<ComponentItemType[]>([]);

  const [texts, setTexts] = React.useState<TextValue[]>([]);

  React.useEffect(() => {
    onmessage = (event) => {
      const nodes = event.data.pluginMessage as ComponentItemType[];
      setComponents(nodes);

      setTexts(initializeTextArray(texts, 1, nodes));
    };
  }, []);

  React.useEffect(() => {
    setTexts(initializeTextArray(texts, numberOfElements, textNodes));
  }, [numberOfElements]);

  const generate = () => {
    parent.postMessage(
      { pluginMessage: { type: 'generate', values: texts } },
      '*'
    );
  };

  if (texts.length === 0 || numberOfElements > texts.length) {
    return <p>Loading</p>;
  }

  return (
    <Layout>
      <NumberOfElements>
        <span>Number of elements to add: </span>
        <Select
          value={numberOfElements}
          onChange={(e) => setNumberOfElements(Number(e.target.value))}
        >
          {numberOfElementsOptions.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Select>
      </NumberOfElements>

      <TextInputList>
        {Array.from(Array(numberOfElements)).map((_, index) => (
          <Row key={index}>
            {textNodes.map((textNode) => {
              return (
                <TextInputCell key={textNode.id}>
                  <TextInputLabel>{textNode.name}</TextInputLabel>
                  <TextInput
                    value={texts[index][textNode.id]}
                    onChange={(e) => {
                      const { value } = e.target;
                      setTexts((_texts) => {
                        const copy = [...texts];
                        copy[index] = {
                          ..._texts[index],
                          [textNode.id]: value,
                        };

                        return copy;
                      });
                    }}
                  />
                </TextInputCell>
              );
            })}
          </Row>
        ))}
      </TextInputList>

      <DuplicateButton onClick={generate}>Duplicate!</DuplicateButton>
    </Layout>
  );
};
