import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Toast, ToastProvider, ToastViewport } from './components/ui/toast';
import { useToast } from './components/ui/use-toast';
import { Progress } from './components/ui/progress';

// Interfaces
interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'shooting' | 'dribbling' | 'defense' | 'conditioning' | 'teamwork';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Training {
  id: string;
  name: string;
  exercises: Exercise[];
  position: string;
  focusArea: string;
  difficulty: string;
  duration: number;
}

function App() {
  const [selectedPosition, setSelectedPosition] = useState<string>('guard');
  const [focusArea, setFocusArea] = useState<string>('shooting');
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customName, setCustomName] = useState('');
  const { toast } = useToast();

  // Sample exercises data
  const exercisesData: Exercise[] = [
    {
      id: '1',
      name: 'Spot-Up Shooting',
      description: 'Practice shooting from 5 spots around the perimeter. Make 10 shots from each spot.',
      duration: 300,
      type: 'shooting',
      difficulty: 'beginner'
    },
    {
      id: '2',
      name: 'Crossover Dribbling',
      description: 'Practice crossover dribble while moving up and down the court. Focus on keeping the ball low.',
      duration: 180,
      type: 'dribbling',
      difficulty: 'beginner'
    },
    {
      id: '3',
      name: 'Defensive Slides',
      description: 'Practice defensive slides in a zigzag pattern down the court. Keep your body low and feet active.',
      duration: 240,
      type: 'defense',
      difficulty: 'beginner'
    },
    {
      id: '4',
      name: 'Pull-Up Jumpers',
      description: 'Dribble from half-court, perform a move, and shoot a pull-up jumper. Alternate sides.',
      duration: 360,
      type: 'shooting',
      difficulty: 'intermediate'
    },
    {
      id: '5',
      name: 'Advanced Ball Handling',
      description: 'Two-ball dribbling drills. Dribble two basketballs simultaneously, alternating heights.',
      duration: 300,
      type: 'dribbling',
      difficulty: 'advanced'
    },
    {
      id: '6',
      name: 'Pick and Roll Defense',
      description: 'Practice defending pick and roll situations with a partner. Focus on communication and positioning.',
      duration: 420,
      type: 'defense',
      difficulty: 'advanced'
    },
    {
      id: '7',
      name: 'Full-Court Sprints',
      description: 'Sprint from baseline to baseline. Complete 10 repetitions with 30 seconds rest between each.',
      duration: 300,
      type: 'conditioning',
      difficulty: 'intermediate'
    },
    {
      id: '8',
      name: 'Post Move Sequence',
      description: 'Practice a sequence of post moves: drop step, up-and-under, hook shot. 10 reps on each side.',
      duration: 360,
      type: 'shooting',
      difficulty: 'intermediate'
    },
    {
      id: '9',
      name: '3-Man Weave',
      description: 'Practice 3-man weave drill full court, finishing with a layup. Focus on timing and spacing.',
      duration: 300,
      type: 'teamwork',
      difficulty: 'intermediate'
    },
    {
      id: '10',
      name: 'Corner Three Shooting',
      description: 'Take 20 three-point shots from each corner. Track your percentage.',
      duration: 240,
      type: 'shooting',
      difficulty: 'advanced'
    },
  ];

  // Generate training plan based on selected options
  const generateTraining = () => {
    // Filter exercises based on difficulty and focus area
    const filteredExercises = exercisesData.filter(exercise => {
      if (exercise.difficulty === difficulty || 
         (difficulty === 'advanced' && exercise.difficulty === 'intermediate')) {
        // For shooting focus, include more shooting exercises
        if (focusArea === 'shooting' && exercise.type === 'shooting') {
          return true;
        }
        // For ball handling focus, include dribbling exercises
        else if (focusArea === 'ball-handling' && 
                (exercise.type === 'dribbling' || exercise.type === 'conditioning')) {
          return true;
        }
        // For defense focus, include defense exercises
        else if (focusArea === 'defense' && 
                (exercise.type === 'defense' || exercise.type === 'conditioning')) {
          return true;
        }
        // For all-around focus, include any exercise
        else if (focusArea === 'all-around') {
          return true;
        }
      }
      return false;
    });

    // Randomize and select 4-6 exercises
    const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
    const exerciseCount = Math.floor(Math.random() * 3) + 4; // 4-6 exercises
    const selectedExercises = shuffled.slice(0, exerciseCount);

    // Calculate total duration
    const totalDuration = selectedExercises.reduce((total, ex) => total + ex.duration, 0);

    // Generate a name for the training
    const trainingName = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} for ${selectedPosition.charAt(0).toUpperCase() + selectedPosition.slice(1)}s`;

    // Create the training plan
    const newTraining: Training = {
      id: Date.now().toString(),
      name: customName || trainingName,
      exercises: selectedExercises,
      position: selectedPosition,
      focusArea: focusArea,
      difficulty: difficulty,
      duration: totalDuration
    };

    // Add to training list
    setTrainings([...trainings, newTraining]);
    setSelectedTraining(newTraining);
    setCurrentExerciseIndex(0);
    setExerciseTime(0);
    setIsRunning(false);

    toast({
      title: "Training Plan Created",
      description: `Your ${trainingName} plan is ready!`,
    });
  };

  // Handle starting a workout
  const startWorkout = (training: Training) => {
    setSelectedTraining(training);
    setCurrentExerciseIndex(0);
    setExerciseTime(0);
    setIsRunning(true);
  };

  // Timer effect for exercise
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && selectedTraining) {
      interval = setInterval(() => {
        if (exerciseTime < selectedTraining.exercises[currentExerciseIndex].duration) {
          setExerciseTime(prev => prev + 1);
        } else {
          // Move to next exercise or finish workout
          if (currentExerciseIndex < selectedTraining.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setExerciseTime(0);
          } else {
            // Workout complete
            setIsRunning(false);
            toast({
              title: "Workout Complete!",
              description: "You've completed your training session.",
            });
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, exerciseTime, currentExerciseIndex, selectedTraining, toast]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background py-8 px-4 md:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Basketball Training Planner</h1>
          <p className="text-muted-foreground">Create personalized training plans for basketball players</p>
        </header>

        <Tabs defaultValue="create" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Plan</TabsTrigger>
            <TabsTrigger value="my-plans">My Plans ({trainings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="p-4 bg-card rounded-md shadow">
            <h2 className="text-xl font-semibold mb-4">Create Your Training Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label htmlFor="position">Player Position</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guard">Guard</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="wing">Wing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label htmlFor="focus">Training Focus</Label>
                  <Select value={focusArea} onValueChange={setFocusArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shooting">Shooting</SelectItem>
                      <SelectItem value="ball-handling">Ball Handling</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="all-around">All-Around</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label htmlFor="name">Custom Name (Optional)</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter a name for your plan" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={generateTraining}>
              Generate Training Plan
            </Button>
          </TabsContent>

          <TabsContent value="my-plans" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Training Plans</h2>
            
            {trainings.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-md shadow">
                <p>You haven't created any training plans yet.</p>
                <Button className="mt-4" variant="outline" onClick={() => document.querySelector('[data-value="create"]')?.click()}>Create Your First Plan</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainings.map(training => (
                  <div key={training.id} className="bg-card p-4 rounded-md shadow hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">{training.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {training.exercises.length} exercises • {Math.round(training.duration / 60)} min
                    </p>
                    <div className="text-xs text-muted-foreground mb-3">
                      <span className="inline-block bg-primary/20 rounded px-2 py-0.5 mr-1">
                        {training.position}
                      </span>
                      <span className="inline-block bg-primary/20 rounded px-2 py-0.5 mr-1">
                        {training.focusArea}
                      </span>
                      <span className="inline-block bg-primary/20 rounded px-2 py-0.5">
                        {training.difficulty}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => startWorkout(training)}
                    >
                      Start Workout
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedTraining && (
          <div className="mt-8 bg-card p-6 rounded-md shadow max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">
              {selectedTraining.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTraining.exercises.length} exercises • {Math.round(selectedTraining.duration / 60)} minutes
            </p>

            {isRunning ? (
              <div className="mb-6">
                <h3 className="font-medium text-lg">
                  Current Exercise: {selectedTraining.exercises[currentExerciseIndex].name}
                </h3>
                <p className="mb-3 text-muted-foreground">
                  {selectedTraining.exercises[currentExerciseIndex].description}
                </p>
                
                <div className="flex items-center mb-2">
                  <div className="flex-1 mr-4">
                    <Progress 
                      value={(exerciseTime / selectedTraining.exercises[currentExerciseIndex].duration) * 100} 
                    />
                  </div>
                  <div className="text-lg font-mono">
                    {formatTime(exerciseTime)} / {formatTime(selectedTraining.exercises[currentExerciseIndex].duration)}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  
                  <Button 
                    variant={currentExerciseIndex < selectedTraining.exercises.length - 1 ? 'default' : 'destructive'}
                    onClick={() => {
                      if (currentExerciseIndex < selectedTraining.exercises.length - 1) {
                        // Skip to next exercise
                        setCurrentExerciseIndex(prev => prev + 1);
                        setExerciseTime(0);
                      } else {
                        // End workout
                        setIsRunning(false);
                        toast({
                          title: "Workout Complete!",
                          description: "You've completed your training session.",
                        });
                      }
                    }}
                  >
                    {currentExerciseIndex < selectedTraining.exercises.length - 1 ? 'Skip' : 'Finish'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Exercises:</h3>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  {selectedTraining.exercises.map((exercise, index) => (
                    <li key={exercise.id} className="text-sm">
                      <span className="font-medium">{exercise.name}</span> - {formatTime(exercise.duration)}
                      <p className="text-xs text-muted-foreground">{exercise.description}</p>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  onClick={() => setIsRunning(true)}
                >
                  Start Workout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <ToastViewport />
    </ToastProvider>
  );
}

export default App;