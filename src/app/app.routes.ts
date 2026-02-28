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
import { WeaponDetailsComponent } from './pages/weapon-details/weapon-details.component';
import { ArtifactDetailsComponent } from './pages/artifact-details/artifact-details.component';
import { MaterialsComponent } from './pages/materials/materials.component';
import { MaterialDetailsComponent } from './pages/material-details/material-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tierlist', component: TierlistComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'characters/:slug', component: CharacterDetailsComponent },
  { path: 'guides', component: GuidesComponent },
  { path: 'guides/:slug', component: GuideDetailsComponent },
  { path: 'weapons', component: WeaponsComponent },
  { path: 'weapons/:slug', component: WeaponDetailsComponent },
  { path: 'artifacts', component: ArtifactsComponent },
  { path: 'artifacts/:slug', component: ArtifactDetailsComponent },
  { path: 'materials', component: MaterialsComponent },
  { path: 'materials/:slug', component: MaterialDetailsComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'tierlist-maker', component: TierlistMakerComponent },
  { path: 'tierlist-viewer', component: TierlistViewerComponent },
  { path: 'tierlist-maker', component: TierlistMakerComponent },
  // { path: 'todo', component: TodoComponent },
];
