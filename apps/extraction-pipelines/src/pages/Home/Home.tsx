import React, { Suspense } from 'react';
import { Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { IH1 } from '../../components/heading/IH1';

const Home = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Wrapper>
          <IH1>Integrations</IH1>
        </Wrapper>
      </Suspense>
    </>
  );
};

const Wrapper = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;
export default Home;
