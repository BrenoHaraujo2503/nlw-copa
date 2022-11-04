import { useState, useEffect } from "react";
import { Share } from 'react-native'
import { useRoute } from "@react-navigation/native";
import { HStack, useToast, VStack } from "native-base";

import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PoolCardProps } from '../components/PoolCard'
import { Guesses } from '../components/Guesses'
import { api } from "../services/api";
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";

interface RouteParams {
  id: string;
}

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [optionSelect, setOptionSelect] = useState<'GUESSES' | 'RANKING'>('GUESSES');
  const [poolDetails, setPoolDetails] = useState<PoolCardProps>({} as PoolCardProps);

  const toast = useToast()
  const route = useRoute();
  const { id } = route.params as RouteParams

  async function fetchPoolDetails() {
    try {
      setIsLoading(true)

      const response = await api.get(`/pools/${id}`)

      setPoolDetails(response.data.pool)
    } catch (error) {
      console.log(error)
      toast.show({
        title: 'Não foi possivel carregar os detalhes desse bolão',
        placement: 'top',
        bgColor: 'red.500'
      });
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: poolDetails.code
    });
  }

  useEffect(() => {
    fetchPoolDetails()
  }, [id])

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bg="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {
        poolDetails._count?.participants > 0 ?
          <VStack px={5} flex={1}>
            <PoolHeader data={poolDetails} />

            <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
              <Option
                title="Seus palpites"
                isSelected={optionSelect === 'GUESSES'}
                onPress={() => setOptionSelect('GUESSES')}
              />
              <Option
                title="Ranking do grupo"
                isSelected={optionSelect === 'RANKING'}
                onPress={() => setOptionSelect('RANKING')}
              />
            </HStack>

            <Guesses code={poolDetails.code} poolId={poolDetails.id} />
          </VStack> :
          <EmptyMyPoolList code={poolDetails.code} />
      }
    </VStack>
  )
}