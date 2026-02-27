import { Routes } from '@angular/router';
import { TodoComponent } from './pages/todo/todo.component';
import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { TierlistComponent } from './pages/tierlist/tierlist.component';
import { WeaponsComponent } from './pages/weapons/weapons.component';
import { ArtifactsComponent } from './pages/artifacts/artifacts.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { CharacterDetailsComponent } from './pages/character-details/character-details.component';
import { TierlistMakerComponent } from './pages/tierlist-maker/tierlist-maker.component';
import { GuidesComponent } from './pages/guides/guides.component';
import { GuideDetailsComponent } from './pages/guide-details/guide-details.component';
import { TierlistViewerComponent } from './pages/tierlist-viewer/tierlist-viewer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tierlist', component: TierlistComponent },
  { path: 'tierlist-maker', component: TierlistMakerComponent },
  { path: 'tierlist-viewer', component: TierlistViewerComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'characters/:name', component: CharacterDetailsComponent },
  { path: 'guides', component: GuidesComponent },
  { path: 'guides/:slug', component: GuideDetailsComponent },
  // { path: 'weapons', component: WeaponsComponent },
  // { path: 'artifacts', component: ArtifactsComponent },
  { path: 'tools', component: ToolsComponent },
  // { path: 'todo', component: TodoComponent },
  { path: 'tierlist-maker', component: TierlistMakerComponent },
];
