import { Routes } from '@angular/router';
import { TodoComponent } from './pages/tools/todo/todo.component';
import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { TierlistComponent } from './pages/tierlist/tierlist.component';
import { EndgamesComponent } from './pages/endgames/endgames.component';
import { WeaponsComponent } from './pages/weapons/weapons.component';
import { ArtifactsComponent } from './pages/artifacts/artifacts.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { AbyssComponent } from './pages/endgames/abyss/abyss.component';
import { StygianComponent } from './pages/endgames/stygian/stygian.component';
import { TheatreComponent } from './pages/endgames/theatre/theatre.component';
import { CharacterDetailsComponent } from './pages/character-details/character-details.component';
import { TierlistMakerComponent } from './pages/tierlist-maker/tierlist-maker.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tierlist', component: TierlistComponent },
  { path: 'tierlist-maker', component: TierlistMakerComponent },
  // {
  //   path: 'endgames',
  //   component: EndgamesComponent,
  //   children: [
  //     { path: 'abyss', component: AbyssComponent },
  //     { path: 'stygian', component: StygianComponent },
  //     { path: 'theatre', component: TheatreComponent },
  //   ],
  // },
  // { path: 'characters', component: CharactersComponent },
  // { path: 'characters/:name', component: CharacterDetailsComponent },
  // { path: 'weapons', component: WeaponsComponent },
  // { path: 'artifacts', component: ArtifactsComponent },
  // {
  //   path: 'tools',
  //   component: ToolsComponent,
  //   children: [{ path: 'todo', component: TodoComponent }],
  // },
];
