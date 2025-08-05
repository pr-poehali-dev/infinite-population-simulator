import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const PopulationSimulator = () => {
  const [population, setPopulation] = useState(100);
  const [birthRate, setBirthRate] = useState(2.1);
  const [deathRate, setDeathRate] = useState(1.8);
  const [speedMode, setSpeedMode] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const speedModes = [
    { id: 1, label: 'Реальное время', multiplier: 1, unit: 'сек' },
    { id: 2, label: 'День/сек', multiplier: 86400, unit: 'дней' },
    { id: 3, label: 'Месяц/сек', multiplier: 2592000, unit: 'мес' },
    { id: 4, label: 'Год/сек', multiplier: 31536000, unit: 'лет' },
    { id: 5, label: '10 лет/сек', multiplier: 315360000, unit: 'дек' },
    { id: 6, label: '100 лет/сек', multiplier: 3153600000, unit: 'век' },
    { id: 7, label: '1000 лет/сек', multiplier: 31536000000, unit: 'тыс.л' },
    { id: 8, label: '10000 лет/сек', multiplier: 315360000000, unit: '10тыс.л' }
  ];

  const generateRandomVariation = (base: number, variation: number = 0.3) => {
    return Math.max(0.1, base + (Math.random() - 0.5) * variation * 2);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setPopulation(prev => {
          if (prev <= 0) return 0;
          
          // Ограничиваем вариации, чтобы не было резких скачков
          const currentBirthRate = generateRandomVariation(birthRate, 0.2);
          const currentDeathRate = generateRandomVariation(deathRate, 0.2);
          
          setBirthRate(currentBirthRate);
          setDeathRate(currentDeathRate);
          
          // Более мягкий расчет роста
          const netGrowthRate = (currentBirthRate - currentDeathRate) / 100;
          const timeMultiplier = speedModes.find(mode => mode.id === speedMode)?.multiplier || 1;
          
          // Ограничиваем максимальное изменение за итерацию
          const maxChangePerSecond = 0.1; // Максимум 10% изменения за секунду
          const rawGrowthFactor = netGrowthRate * timeMultiplier / 31536000;
          const limitedGrowthFactor = Math.max(-maxChangePerSecond, Math.min(maxChangePerSecond, rawGrowthFactor));
          
          const growthFactor = 1 + limitedGrowthFactor;
          
          // Минимальный порог выживания
          const newPopulation = Math.max(1, Math.round(prev * growthFactor));
          
          // Если население критически мало, добавляем стабилизацию
          if (newPopulation < 10 && netGrowthRate < 0) {
            return Math.max(1, prev - 1); // Медленное убывание вместо мгновенной смерти
          }
          
          return newPopulation;
        });
        
        setTotalTime(prev => prev + (speedModes.find(mode => mode.id === speedMode)?.multiplier || 1));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, speedMode, birthRate, deathRate]);

  const formatTime = (seconds: number) => {
    const years = Math.floor(seconds / 31536000);
    const days = Math.floor((seconds % 31536000) / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (years > 0) return `${years} лет, ${days} дней`;
    if (days > 0) return `${days} дней, ${hours} часов`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${seconds}с`;
  };

  const formatPopulation = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)} трлн`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)} млрд`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)} млн`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)} тыс`;
    return num.toString();
  };

  const resetSimulation = () => {
    setPopulation(100);
    setBirthRate(2.1);
    setDeathRate(1.8);
    setTotalTime(0);
    setIsRunning(false);
  };

  const netGrowth = birthRate - deathRate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-mono">
            СИМУЛЯТОР ПОПУЛЯЦИИ ЧЕЛОВЕЧЕСТВА
          </h1>
          <p className="text-blue-200 text-lg">Научная модель развития цивилизации</p>
        </div>

        {/* Speed Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
          {speedModes.map((mode) => (
            <Button
              key={mode.id}
              variant={speedMode === mode.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSpeedMode(mode.id)}
              className={`text-xs h-16 flex flex-col ${
                speedMode === mode.id 
                  ? 'bg-blue-600 text-white border-blue-400' 
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span className="font-bold">{mode.id}</span>
              <span className="text-[10px] leading-tight">{mode.label}</span>
            </Button>
          ))}
        </div>

        {/* Main Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Birth Rate */}
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-300 text-lg flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Рождаемость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-200 font-mono mb-2">
                {birthRate.toFixed(2)}%
              </div>
              <div className="text-green-400 text-sm">на 100 человек в год</div>
            </CardContent>
          </Card>

          {/* Population Counter */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-800/30 border-blue-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-300 text-lg flex items-center gap-2">
                <Icon name="Users" size={20} />
                Население
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-white font-mono mb-2 animate-pulse">
                {formatPopulation(population)}
              </div>
              <div className="text-blue-400 text-sm">
                Время: {formatTime(totalTime)}
              </div>
              <div className={`text-sm mt-2 ${
                netGrowth > 0 ? 'text-green-400' : netGrowth < 0 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {netGrowth > 0 ? '↗ Рост' : netGrowth < 0 ? '↘ Убыль' : '→ Стабильность'}: {netGrowth.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          {/* Death Rate */}
          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-600/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-300 text-lg flex items-center gap-2">
                <Icon name="TrendingDown" size={20} />
                Смертность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-200 font-mono mb-2">
                {deathRate.toFixed(2)}%
              </div>
              <div className="text-red-400 text-sm">на 100 человек в год</div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setIsRunning(!isRunning)}
            size="lg"
            className={`px-8 ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Icon name={isRunning ? "Pause" : "Play"} size={20} className="mr-2" />
            {isRunning ? 'Пауза' : 'Запуск'}
          </Button>
          
          <Button 
            onClick={resetSimulation}
            size="lg"
            variant="outline"
            className="px-8 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Icon name="RotateCcw" size={20} className="mr-2" />
            Сброс
          </Button>
        </div>

        {/* Statistics Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4 text-center">
              <div className="text-slate-400 text-sm mb-1">Текущая скорость</div>
              <div className="text-white font-mono text-lg">
                {speedModes.find(mode => mode.id === speedMode)?.label}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4 text-center">
              <div className="text-slate-400 text-sm mb-1">Статус симуляции</div>
              <div className={`font-mono text-lg ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
                {isRunning ? '● АКТИВНА' : '● ОСТАНОВЛЕНА'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4 text-center">
              <div className="text-slate-400 text-sm mb-1">Тренд роста</div>
              <div className={`font-mono text-lg ${
                netGrowth > 0.5 ? 'text-green-400' : 
                netGrowth < -0.5 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {netGrowth > 0.5 ? '📈 РОСТ' : netGrowth < -0.5 ? '📉 СПАД' : '📊 СТАБИЛЬНО'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return <PopulationSimulator />;
};

export default Index;